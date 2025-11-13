import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SelectFinancialAsset } from "@shared/schema";

interface AssetAllocationChartProps {
  assets: SelectFinancialAsset[];
}

const COLORS = [
  '#40E0D0', // Turquoise
  '#1E90FF', // Blue
  '#0047AB', // Cobalt
  '#4169E1', // Royal Blue
  '#00CED1', // Dark Turquoise
  '#5F9EA0', // Cadet Blue
];

export function AssetAllocationChart({ assets }: AssetAllocationChartProps) {
  const data = assets.map((asset, index) => ({
    name: asset.symbol,
    value: parseFloat(asset.totalValue || "0"),
    type: asset.assetType,
    color: COLORS[index % COLORS.length],
  }));

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalValue) * 100).toFixed(2);
      return (
        <div 
          className="rounded-lg p-3 shadow-lg"
          style={{
            background: 'rgba(10, 24, 40, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 224, 208, 0.2)',
          }}
        >
          <p className="font-semibold" style={{ color: data.color }}>{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.type}</p>
          <p className="text-sm font-medium">${data.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{percentage}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  if (assets.length === 0) {
    return (
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
        data-testid="chart-asset-allocation"
      >
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No assets to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid="chart-asset-allocation"
    >
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
