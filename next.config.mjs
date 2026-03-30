/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // OpenNext Cloudflare 使用 define 注入常量
  define: {
    'process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID': JSON.stringify(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AQR_stQAkE2X007Q1-pqgMKjT9G1VgP44EFBW-2FhJxwIoFF9gHB1bedOwdHPLLF869unxqX48pQIRhs'),
  },
}

export default nextConfig
