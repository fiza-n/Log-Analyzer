import React from 'react'

export default function StatCards({ data }) {
  const {
    total_lines = 0,
    parsed_lines = 0,
    skipped_lines = 0,
    total_requests = 0,
    error_rate = 0,
    avg_response_ms = 0,
    p95_response_ms = 0,
    unique_ips = 0,
  } = data

  const parseRate = total_lines > 0 ? ((parsed_lines / total_lines) * 100).toFixed(1) : '—'

  const cards = [
    {
      label: 'Total Requests',
      value: total_requests.toLocaleString(),
      sub: `${parseRate}% parse rate`,
      color: 'var(--accent-cyan)',
      bg: 'var(--accent-cyan-dim)',
    },
    {
      label: 'Error Rate',
      value: `${(error_rate * 100).toFixed(2)}%`,
      sub: `4xx + 5xx responses`,
      color: error_rate > 0.1 ? 'var(--status-error)' : error_rate > 0.05 ? 'var(--status-warn)' : 'var(--status-ok)',
      bg: error_rate > 0.1 ? 'var(--status-error-dim)' : error_rate > 0.05 ? 'var(--status-warn-dim)' : 'var(--status-ok-dim)',
    },
    {
      label: 'Avg Response',
      value: formatMs(avg_response_ms),
      sub: `p95: ${formatMs(p95_response_ms)}`,
      color: avg_response_ms > 1000 ? 'var(--status-error)' : avg_response_ms > 500 ? 'var(--status-warn)' : 'var(--status-ok)',
      bg: avg_response_ms > 1000 ? 'var(--status-error-dim)' : avg_response_ms > 500 ? 'var(--status-warn-dim)' : 'var(--status-ok-dim)',
    },
    {
      label: 'Unique IPs',
      value: unique_ips.toLocaleString(),
      sub: `distinct clients`,
      color: 'var(--status-info)',
      bg: 'var(--status-info-dim)',
    },
    {
      label: 'Skipped Lines',
      value: skipped_lines.toLocaleString(),
      sub: `of ${total_lines.toLocaleString()} total`,
      color: skipped_lines > 0 ? 'var(--status-warn)' : 'var(--text-muted)',
      bg: skipped_lines > 0 ? 'var(--status-warn-dim)' : 'var(--bg-elevated)',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 14,
      marginBottom: 16,
    }}>
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 18px',
            position: 'relative',
            overflow: 'hidden',
            animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
          }}
        >
          {/* Accent bar top */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 2,
            background: card.color,
            opacity: 0.7,
          }} />

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            {card.label}
          </div>

          <div style={{
            fontSize: 26,
            fontWeight: 600,
            color: card.color,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 6,
          }}>
            {card.value}
          </div>

          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
          }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatMs(ms) {
  if (ms == null || isNaN(ms)) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}