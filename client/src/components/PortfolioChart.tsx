import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

export function PortfolioChart() {
  const [timeframe, setTimeframe] = useState('24H');

  // Mock data for demonstration - in real app this would come from API
  const mockData = [
    { time: '00:00', value: 0 },
    { time: '04:00', value: 0 },
    { time: '08:00', value: 0 },
    { time: '12:00', value: 0 },
    { time: '16:00', value: 0 },
    { time: '20:00', value: 0 },
    { time: '24:00', value: 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Performance</CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24H">24H</SelectItem>
              <SelectItem value="7D">7D</SelectItem>
              <SelectItem value="30D">30D</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {mockData.every(d => d.value === 0) ? (
            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-gray-500">Portfolio chart will appear here</p>
                <p className="text-xs text-gray-400 mt-1">Start trading to see your performance</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
