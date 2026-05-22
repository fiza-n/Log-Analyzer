import React from 'react'
import { Activity, RotateCcw } from 'lucide-react'

export default function Header({ fileName, hasData, onReset }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 56,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Activity size={18} color="var(--accent-cyan)" />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
        }}>
          LOGLENS
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          marginLeft: 2,
        }}>
          v1.0
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {fileName && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)',
            padding: '4px 10px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {fileName}
          </div>
        )}

        {hasData && (
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              padding: '5px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-cyan)'
              e.currentTarget.style.color = 'var(--accent-cyan)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <RotateCcw size={12} />
            new file
          </button>
        )}
      </div>
    </header>
  )
}