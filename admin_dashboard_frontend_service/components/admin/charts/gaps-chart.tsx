'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GapsChartProps {
  data: Array<{
    skill: string
    occurrences: number
  }>
}

export function GapsChart({ data }: GapsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Skill Gaps</CardTitle>
        <CardDescription>Most frequently missing skills among users</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={600}>
          <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 150, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
              stroke="#9ca3af"
            />
            <YAxis 
              dataKey="skill" 
              type="category"
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              width={140}
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
              dataKey="occurrences" 
              fill="#f97316"
              radius={[0, 6, 6, 0]}
              stroke="#ea580c"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}