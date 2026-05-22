import React, { useState } from 'react'
import StatCards from './StatCards.jsx'
import StatusPanel from './StatusPanel.jsx'
import SlowEndpoints from './SlowEndpoints.jsx'
import TopIPs from './TopIPs.jsx'
import Timeline from './Timeline.jsx'
import ParseQuality from './ParseQuality.jsx'

export default function Dashboard({ data }) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'errors',   label: 'Errors & Status' },
    { id: 'perf',     label: 'Performance' },
    { id: 'traffic',  label: 'Traffic' },
  ]

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      paddingTop: 28,
      animation: 'fadeUp 0.4s ease forwards',
    }}>
      {/* Stat Cards Row */}
      <StatCards data={data} />

      {/* Parse Quality Banner */}
      <ParseQuality data={data} />

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        borderBottom: '1px solid var(--border)',
        marginBottom: 28,
        marginTop: 8,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-cyan)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '10px 16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 500 : 400,
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Timeline data={data} />
          </div>
          <StatusPanel data={data} />
          <SlowEndpoints data={data} limit={5} />
        </div>
      )}

      {activeTab === 'errors' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <StatusPanel data={data} expanded />
          <ErrorEndpoints data={data} />
        </div>
      )}

      {activeTab === 'perf' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          <SlowEndpoints data={data} limit={20} />
        </div>
      )}

      {activeTab === 'traffic' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <TopIPs data={data} />
          <MethodBreakdown data={data} />
        </div>
      )}
    </div>
  )
}

// ─── Error Endpoints (inline small component) ────────────────────────────────
function ErrorEndpoints({ data }) {
  const endpoints = data.error_endpoints || []
  return (
    <Panel title="Top Error Endpoints" icon="⚠">
      {endpoints.length === 0 ? (
        <Empty text="No error endpoints found" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Endpoint', '5xx', '4xx', 'Error Rate'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, i) => {
              const rate = ep.error_rate ?? ((ep.errors / ep.total) * 100)
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>
                    {ep.path}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--status-error)' }}>{ep.server_errors ?? '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--status-warn)' }}>{ep.client_errors ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 3,
                      background: rate > 20 ? 'var(--status-error-dim)' : 'var(--status-warn-dim)',
                      color: rate > 20 ? 'var(--status-error)' : 'var(--status-warn)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                    }}>
                      {typeof rate === 'number' ? rate.toFixed(1) : rate}%
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

// ─── Method Breakdown ─────────────────────────────────────────────────────────
function MethodBreakdown({ data }) {
  const methods = data.method_breakdown || {}
  const total = Object.values(methods).reduce((a, b) => a + b, 0)
  const colors = {
    GET: 'var(--status-ok)',
    POST: 'var(--accent-cyan)',
    PUT: 'var(--status-warn)',
    PATCH: '#a78bfa',
    DELETE: 'var(--status-error)',
  }

  return (
    <Panel title="HTTP Methods" icon="↕">
      {total === 0 ? (
        <Empty text="No method data" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(methods)
            .sort((a, b) => b[1] - a[1])
            .map(([method, count]) => {
              const pct = (count / total) * 100
              const color = colors[method] || 'var(--text-muted)'
              return (
                <div key={method}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                  }}>
                    <span style={{ color }}>{method}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {count.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    background: 'var(--bg-elevated)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 3,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </Panel>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────
export function Panel({ title, icon, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        {icon && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{icon}</span>
        )}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '16px 18px' }}>
        {children}
      </div>
    </div>
  )
}

export function Empty({ text }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '24px 0',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      {text}
    </div>
  )
}

export const thStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '0 8px 10px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
}

export const tdStyle = {
  padding: '10px 8px',
  color: 'var(--text-secondary)',
  fontSize: 13,
}