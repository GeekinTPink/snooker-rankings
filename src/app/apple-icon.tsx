import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0a1628 0%, #143d2a 50%, #0d1f14 100%)',
        }}
      >
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: 999,
            background: '#1a1a1a',
            border: '8px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 800,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          8
        </div>
      </div>
    ),
    { ...size }
  )
}
