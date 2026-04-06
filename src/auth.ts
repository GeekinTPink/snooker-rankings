import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server"
import { getD1 } from "@/lib/d1"

/** 会话与 JWT 有效期（秒），到期后需重新登录 */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 天

/** 无需登录的公开页面路径 */
const PUBLIC_PATHS = [
  "/about",
  "/help",
  "/privacy",
  "/terms",
]

/**
 * 初始化数据库表
 */
async function initDB(db: any) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      email_verified DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run()
  
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      favorite_player TEXT,
      notifications_enabled INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run()
  
  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `).run()
}

/**
 * 保存或更新用户信息
 */

  async function upsertUser(db: any, user: {
    id: string
    email: string
    name: string | null
    image: string | null
    email_verified: string | null
  }) {
    await db.prepare(`
      INSERT INTO users (id, email, name, image, email_verified, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        image = excluded.image,
        email_verified = excluded.email_verified,
        updated_at = datetime('now')
    `).bind(
      user.id,
      user.email,
      user.name ?? "",
      user.image ?? "",
      user.email_verified ?? null
    ).run();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Workers 上无 CF_PAGES；未设 AUTH_URL 时生产环境会 trustHost=false → UntrustedHost → /api/auth/error
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24, // 活跃时最多每天刷新一次会话过期时间
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
  providers: [
    Google({
      clientId:
        process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * 鉴权中间件回调
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl

      // ============================
      // 👇 必须加这一行！！！放行登录流程
      // ============================
      if (pathname.startsWith("/api/auth")) {
        return true;
      }

      // 浏览器标签图标、Apple 图标、OG 图、robots、sitemap（无扩展名路径，需显式放行）
      if (
        pathname === "/icon" ||
        pathname === "/apple-icon" ||
        pathname === "/opengraph-image" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml"
      ) {
        return true
      }
      
      // 登录页面：已登录用户重定向到首页
      if (pathname === "/login") {
        if (auth?.user) {
          return NextResponse.redirect(new URL("/", request.url))
        }
        return true
      }

      // 排名首页与 SEO 落地页：未登录也可访问（仅前端展示前 16 名）
      if (pathname === "/" || pathname === "/rankings") {
        return true
      }
      
      // 公开页面：允许所有人访问
      if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return true
      }
      
      // API 路由：允许未认证请求
      if (pathname.startsWith("/api/")) {
        return true
      }
      
      // 其他所有页面：需要登录
      return !!auth?.user
    },
    
    /**
     * JWT 回调 - 用户登录时将信息添加到 token
     */
    async jwt({ token, user }) {
      // 初次登录时，user 对象存在
      if (user && token.sub) {
        // 将用户信息添加到 token 中
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    
    /**
     * 会话回调
     */
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
    
    /**
     * signIn 回调 - 用户成功登录时存储到 D1
     */
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const db = getD1()
          
          if (db && user.id) {
            // 初始化表
            await initDB(db)
            
            // 存储用户信息
            await upsertUser(db, {
              id: user.id,
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              email_verified: null // Google OAuth 暂不存储验证时间
            })
            
            console.log(`User stored in D1: ${user.email}`)
          } else {
            console.warn("Skip D1 upsert: missing DB binding or user.id", {
              hasDB: !!db,
              hasUserId: !!user.id,
            })
          }
        } catch (error) {
          console.error('Error storing user in D1:', error)
          // 不影响登录流程
        }
      }
      return true
    },
  },
})
