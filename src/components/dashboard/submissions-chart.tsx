"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  submissions: number;
}

interface SubmissionsChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function SubmissionsChart({
  data,
  title = "Form Submissions",
}: SubmissionsChartProps) {
  // Format date for display (e.g., "Jan 15")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Calculate total submissions
  const totalSubmissions = data.reduce((sum, d) => sum + d.submissions, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{totalSubmissions}</p>
            <p className="text-xs text-muted-foreground">Total submissions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No submission data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#A8A8A8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#A8A8A8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
                          <p className="text-sm font-medium text-foreground">
                            {formatDate(label)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value} submissions
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#FAFAFA"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#FAFAFA",
                    stroke: "#0A0A0A",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
