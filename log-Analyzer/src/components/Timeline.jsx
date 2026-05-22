import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, Bar,
} from 'recharts'
import { Panel, Empty } from './Dashboard.jsx'

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export default function Timeline({ data }) {
  const timelineData = data.requests_over_time || []

  if (timelineData.length === 0) {
    return (
      <Panel title="Requests Over Time" icon="📈">
        <Empty text="No timeline data available" />
      </Panel>
    )
  }

  const formattedData = timelineData.map(d => ({
    ...d,
    timeLabel: formatTime(d.time),
  }))

  return (
    <Panel title="Requests Over Time" icon="📈">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={formattedData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="timeLabel"
            stroke="var(--text-muted)"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }}
            interval={Math.max(0, Math.floor(formattedData.length / 6) - 1)}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: '#181c23',
              border: '1px solid #252b38',
              borderRadius: 6,
              fontFamily: 'IBM Plex Mono',
              fontSize: 12,
              color: '#e8ecf4',
            }}
            formatter={(value) => value.toLocaleString()}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            fill="url(#totalGradient)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Total Requests"
          />
          <Line
            type="monotone"
            dataKey="errors"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Errors"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16,
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Total Requests
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
            {formattedData.reduce((sum, d) => sum + d.total, 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Total Errors
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
            {formattedData.reduce((sum, d) => sum + d.errors, 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Error Rate
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: formattedData.reduce((sum, d) => sum + d.errors, 0) / formattedData.reduce((sum, d) => sum + d.total, 0) * 100 > 5 ? '#ef4444' : '#22c55e', fontFamily: 'var(--font-mono)' }}>
            {(formattedData.reduce((sum, d) => sum + d.errors, 0) / formattedData.reduce((sum, d) => sum + d.total, 0) * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    </Panel>
  )
}
