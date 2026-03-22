import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server"

/** 会话与 JWT 有效期（秒），到期后需重新登录 */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 天

/** 无需登录的公开页面路径 */
const PUBLIC_PATHS = [
  "/about",
  "/help",
  "/privacy",
  "/terms",
]

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
      // Cloudflare 可只配 GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET；亦兼容 Auth.js 的 AUTH_GOOGLE_*
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
     * 在 middleware.ts 中被调用，每次请求都会执行
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      
      // 1. 登录页面：已登录用户重定向到首页
      if (pathname === "/login") {
        if (auth?.user) {
          return NextResponse.redirect(new URL("/", request.url))
        }
        return true // 未登录用户可以访问登录页
      }
      
      // 2. 公开页面：允许所有人访问
      if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return true
      }
      
      // 3. API 路由：允许未认证请求（由具体 API 自行判断）
      if (pathname.startsWith("/api/")) {
        return true
      }
      
      // 4. 其他所有页面：需要登录
      return !!auth?.user
    },
    
    /**
     * 会话回调
     * 将 JWT 中的用户 ID 添加到 session 中
     */
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
