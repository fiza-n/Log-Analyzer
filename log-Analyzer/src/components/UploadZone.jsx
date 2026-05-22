import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileText, AlertTriangle } from 'lucide-react'

export default function UploadZone({ onUpload, error }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = useCallback((file) => {
    if (!file) return
    onUpload(file)
  }, [onUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleInputChange = (e) => handleFile(e.target.files[0])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 56px)',
      gap: 32,
      animation: 'fadeUp 0.4s ease forwards',
    }}>
      {/* Title block */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--accent-cyan)',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          Server Log Analyzer
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Drop a log file to<br />
          <span style={{ fontWeight: 600 }}>get instant insights</span>
        </h1>
        <p style={{
          marginTop: 12,
          color: 'var(--text-secondary)',
          fontSize: 14,
          fontWeight: 300,
        }}>
          Handles mixed formats, malformed lines, JSON entries, and more
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current.click()}
        style={{
          width: '100%',
          maxWidth: 520,
          height: 220,
          border: `1.5px dashed ${dragging ? 'var(--accent-cyan)' : 'var(--border-bright)'}`,
          borderRadius: 8,
          background: dragging ? 'var(--accent-cyan-dim)' : 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: dragging ? '0 0 0 1px var(--accent-cyan-glow), inset 0 0 40px var(--accent-cyan-dim)' : 'none',
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: dragging ? 'var(--accent-cyan-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${dragging ? 'var(--accent-cyan)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {dragging
            ? <FileText size={22} color="var(--accent-cyan)" />
            : <Upload size={22} color="var(--text-secondary)" />
          }
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
            {dragging ? 'Release to analyze' : 'Drop your log file here'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            or <span style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>browse to upload</span>
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>
          .log · .txt · any plain text
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".log,.txt,text/plain"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'var(--status-error-dim)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 6,
          color: '#fca5a5',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          maxWidth: 520,
          width: '100%',
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Format hint */}
      <div style={{
        maxWidth: 520,
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '14px 16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          marginBottom: 10,
          textTransform: 'uppercase',
        }}>
          Expected format
        </div>
        {[
          '2024-03-15T14:23:01Z 192.168.1.42 GET /api/users 200 142ms',
          '2024/03/15 14:23:02 10.0.0.7 POST /api/login 401 89ms',
          '{"timestamp":"2024-03-15T14:23:03Z","ip":"10.0.0.1",...}',
          '1710512581 172.16.0.3 DELETE /api/item/9 204 31ms',
        ].map((line, i) => (
          <div key={i} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: i === 2 ? 'var(--status-info)' : 'var(--text-secondary)',
            padding: '2px 0',
            opacity: 1 - i * 0.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}