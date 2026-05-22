import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Panel, Empty } from './Dashboard.jsx'

const STATUS_COLORS = {
  '2xx': '#22c55e',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
  'other': '#6b7280',
}

export default function StatusPanel({ data, expanded }) {
  const statusDist = data.status_distribution || {}

  const chartData = Object.entries(statusDist)
    .map(([code, count]) => ({
      name: code,
      value: count,
      color: STATUS_COLORS[code] || STATUS_COLORS.other,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <Panel title="Status Code Distribution" icon="◑">
      {chartData.length === 0 ? (
        <Empty text="No status data" />
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#181c23',
                  border: '1px solid #252b38',
                  borderRadius: 6,
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 12,
                  color: '#e8ecf4',
                }}
                formatter={(val, name) => [
                  `${val.toLocaleString()} (${((val / total) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {chartData.map(d => (
              <div key={d.name} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: d.color,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: d.color,
                  }}>
                    {d.name}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' }}>
                    {d.value.toLocaleString()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 40, textAlign: 'right' }}>
                    {((d.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}