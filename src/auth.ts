import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server"

/** 会话与 JWT 有效期（秒），到期后需重新登录 */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 天

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
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      if (pathname === "/login") {
        if (auth?.user) {
          return NextResponse.redirect(new URL("/", request.url))
        }
        return true
      }
      return !!auth?.user
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
