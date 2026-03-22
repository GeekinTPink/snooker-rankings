import { auth } from "@/auth"

export default auth(() => {
  // 鉴权逻辑在 auth.ts 的 callbacks.authorized
})

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
}
