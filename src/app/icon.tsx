import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
            width: 22,
            height: 22,
            borderRadius: 999,
            background: '#1a1a1a',
            border: '2px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 12,
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
