import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
  currency?: string;
}

export function RevenueChart({ data, currency = "USD" }: RevenueChartProps) {
  return (
    <Card
      style={{
        background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
        backdropFilter: "blur(16px)",
      }}
      data-testid="chart-revenue"
    >
      <CardHeader>
        <CardTitle className="text-lg">Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#40E0D0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1E90FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 24, 40, 0.95)",
                border: "1px solid rgba(64, 224, 208, 0.3)",
                borderRadius: "8px",
                backdropFilter: "blur(16px)",
              }}
              labelStyle={{ color: "#40E0D0" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#40E0D0"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              dot={{ fill: "#40E0D0", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
