import { ImageResponse } from 'next/og'
import { OG_IMAGE_ALT } from '@/lib/seo'

export const alt = OG_IMAGE_ALT
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(145deg, #0a1628 0%, #143d2a 45%, #0d1f14 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          World Snooker Rankings
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 28,
            color: '#e8c547',
            textAlign: 'center',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          WST Gamechanger data · Top 16 free · Full top 64 with sign-in
        </div>
        <div
          style={{
            fontSize: 22,
            marginTop: 36,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          Official-style prize-money world rankings
        </div>
      </div>
    ),
    { ...size }
  )
}
