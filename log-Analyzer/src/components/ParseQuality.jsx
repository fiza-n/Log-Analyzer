import React, { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ParseQuality({ data }) {
  const [expanded, setExpanded] = useState(false)

  const {
    total_lines = 0,
    skipped_lines = 0,
    json_lines = 0,
    alt_format_lines = 0,
    format_anomalies = [],
  } = data

  const skipRate = total_lines > 0 ? (skipped_lines / total_lines) * 100 : 0
  const healthy = skipRate < 5

  if (skipped_lines === 0 && json_lines === 0 && alt_format_lines === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        background: 'var(--status-ok-dim)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 6,
        marginBottom: 16,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--status-ok)',
      }}>
        <CheckCircle size={13} />
        All {total_lines.toLocaleString()} lines parsed successfully — clean log file
      </div>
    )
  }

  return (
    <div style={{
      background: healthy ? 'var(--bg-surface)' : 'var(--status-warn-dim)',
      border: `1px solid ${healthy ? 'var(--border)' : 'rgba(245,158,11,0.25)'}`,
      borderRadius: 6,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {expanded ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
        <AlertTriangle size={13} color={healthy ? 'var(--text-muted)' : 'var(--status-warn)'} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: healthy ? 'var(--text-secondary)' : 'var(--status-warn)',
          flex: 1,
        }}>
          Parse quality: {(100 - skipRate).toFixed(1)}% success
          {skipped_lines > 0 && ` · ${skipped_lines.toLocaleString()} lines skipped`}
          {json_lines > 0 && ` · ${json_lines.toLocaleString()} JSON lines`}
          {alt_format_lines > 0 && ` · ${alt_format_lines.toLocaleString()} alternate format`}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {expanded ? 'hide' : 'details'}
        </span>
      </button>

      {expanded && (
        <div style={{
          padding: '0 14px 12px 14px',
          borderTop: '1px solid var(--border)',
          marginTop: 0,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            paddingTop: 12,
          }}>
            {[
              { label: 'Total Lines', value: total_lines.toLocaleString() },
              { label: 'Parsed OK', value: (total_lines - skipped_lines).toLocaleString(), color: 'var(--status-ok)' },
              { label: 'Skipped', value: skipped_lines.toLocaleString(), color: skipped_lines > 0 ? 'var(--status-warn)' : 'inherit' },
              { label: 'JSON Format', value: json_lines.toLocaleString(), color: 'var(--status-info)' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)', color: color || 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>

          {format_anomalies && format_anomalies.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Format anomalies
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {format_anomalies.map((a, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    padding: '3px 8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    color: 'var(--text-secondary)',
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}