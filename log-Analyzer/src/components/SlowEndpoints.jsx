import React from 'react'
import { Panel, Empty } from './Dashboard.jsx'

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '1px solid var(--border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle = {
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--text-primary)',
}

export default function SlowEndpoints({ data, limit = 5 }) {
  const endpoints = data.slow_endpoints || []
  const displayEndpoints = endpoints.slice(0, limit)

  return (
    <Panel title="Slow Endpoints" icon="🐌">
      {displayEndpoints.length === 0 ? (
        <Empty text="No endpoint data available" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Endpoint', 'Avg (ms)', 'P95 (ms)', 'Max (ms)', 'Count'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayEndpoints.map((ep, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ep.path}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 3,
                    background: ep.avg_ms > 500 ? 'var(--status-error-dim)' : ep.avg_ms > 200 ? 'var(--status-warn-dim)' : 'var(--accent-cyan-dim)',
                    color: ep.avg_ms > 500 ? 'var(--status-error)' : ep.avg_ms > 200 ? 'var(--status-warn)' : 'var(--accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                  }}>
                    {ep.avg_ms.toFixed(1)}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {ep.p95_ms.toFixed(1)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {ep.max_ms.toFixed(1)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {ep.count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  )
}
