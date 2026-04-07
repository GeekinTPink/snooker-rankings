import { auth } from "@/auth"

export default auth(() => {
  // 鉴权逻辑在 auth.ts 的 callbacks.authorized
})

export const config = {
  matcher: [
    // Skip auth for static SEO files so crawlers get no session cookies / RSC vary headers.
    "/((?!api/|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
}
