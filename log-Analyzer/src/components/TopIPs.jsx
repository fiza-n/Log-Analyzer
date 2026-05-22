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

export default function TopIPs({ data, limit = 10 }) {
  const ips = data.top_ips || []
  const displayIPs = ips.slice(0, limit)

  return (
    <Panel title="Top IPs" icon="🌐">
      {displayIPs.length === 0 ? (
        <Empty text="No IP data available" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['IP Address', 'Requests', 'Errors', 'Error Rate'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayIPs.map((ipData, i) => {
              const errorRate = ipData.error_rate ?? 0
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {ipData.ip}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {ipData.requests.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: ipData.errors > 10 ? 'var(--status-error-dim)' : ipData.errors > 0 ? 'var(--status-warn-dim)' : 'transparent',
                      color: ipData.errors > 10 ? 'var(--status-error)' : ipData.errors > 0 ? 'var(--status-warn)' : 'var(--text-secondary)',
                    }}>
                      {ipData.errors}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: errorRate > 10 ? 'var(--status-error-dim)' : errorRate > 0 ? 'var(--status-warn-dim)' : 'var(--accent-cyan-dim)',
                      color: errorRate > 10 ? 'var(--status-error)' : errorRate > 0 ? 'var(--status-warn)' : 'var(--accent-cyan)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}>
                      {errorRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Panel>
  )
}
