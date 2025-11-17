'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface SkillsChartProps {
  data: Array<{
    skill: string
    count: number
  }>
}

export function SkillsChart({ data }: SkillsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Skills in Demand</CardTitle>
        <CardDescription>Most requested skills across all job postings</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="skill" 
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: 500
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              stroke="#2563eb"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}