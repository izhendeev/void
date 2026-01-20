'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000011',
      color: '#4a9eff',
      fontFamily: '"Michroma", monospace',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Something went wrong!</h2>
      <p style={{ fontSize: '14px', marginBottom: '30px', color: '#aaaaaa' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          background: 'transparent',
          color: '#4a9eff',
          border: '2px solid #4a9eff',
          borderRadius: '0',
          cursor: 'pointer',
          fontFamily: '"Michroma", monospace',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}
      >
        Try again
      </button>
    </div>
  )
}
