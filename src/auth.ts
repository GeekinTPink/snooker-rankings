import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Workers 上无 CF_PAGES；未设 AUTH_URL 时生产环境会 trustHost=false → UntrustedHost → /api/auth/error
  trustHost: true,
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
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
