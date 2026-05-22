import React, { useState } from 'react'
import Header from './components/Header.jsx'
import UploadZone from './components/UploadZone.jsx'
import Dashboard from './components/Dashboard.jsx'
import './App.css'

const API_BASE_URL = 'http://localhost:5000'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filename, setFilename] = useState(null)

  const handleUpload = async (file) => {
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('logfile', file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const analysisData = await response.json()
      setData(analysisData)
      setFilename(file.name)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to analyze log file. Make sure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setData(null)
    setFilename(null)
    setError(null)
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Header onReset={handleReset} fileName={filename} hasData={!!data} />
      
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            padding: 32,
            borderRadius: 8,
            border: '1px solid var(--border)',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Analyzing log file...
            </div>
            <div style={{
              width: 40,
              height: 40,
              border: '2px solid var(--border)',
              borderTop: '2px solid var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
          </div>
        </div>
      )}

      {!data ? (
        <UploadZone onUpload={handleUpload} error={error} />
      ) : (
        <Dashboard data={data} />
      )}
    </div>
  )
}

export default App
