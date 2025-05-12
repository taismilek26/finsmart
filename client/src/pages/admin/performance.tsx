import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar, AppHeader } from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Loader2,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertCircle,
  FileCheck,
  ClockIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data
const apiResponseTimeData = [
  { time: "00:00", value: 120 },
  { time: "02:00", value: 115 },
  { time: "04:00", value: 118 },
  { time: "06:00", value: 140 },
  { time: "08:00", value: 175 },
  { time: "10:00", value: 210 },
  { time: "12:00", value: 205 },
  { time: "14:00", value: 185 },
  { time: "16:00", value: 190 },
  { time: "18:00", value: 205 },
  { time: "20:00", value: 175 },
  { time: "22:00", value: 135 },
];

const cpuUsageData = [
  { time: "00:00", value: 35 },
  { time: "02:00", value: 32 },
  { time: "04:00", value: 30 },
  { time: "06:00", value: 35 },
  { time: "08:00", value: 58 },
  { time: "10:00", value: 72 },
  { time: "12:00", value: 75 },
  { time: "14:00", value: 68 },
  { time: "16:00", value: 64 },
  { time: "18:00", value: 70 },
  { time: "20:00", value: 55 },
  { time: "22:00", value: 42 },
];

const memoryUsageData = [
  { time: "00:00", value: 45 },
  { time: "02:00", value: 47 },
  { time: "04:00", value: 46 },
  { time: "06:00", value: 48 },
  { time: "08:00", value: 65 },
  { time: "10:00", value: 78 },
  { time: "12:00", value: 85 },
  { time: "14:00", value: 80 },
  { time: "16:00", value: 75 },
  { time: "18:00", value: 82 },
  { time: "20:00", value: 68 },
  { time: "22:00", value: 52 },
];

const errorData = [
  { time: "00:00", value: 2 },
  { time: "02:00", value: 1 },
  { time: "04:00", value: 0 },
  { time: "06:00", value: 0 },
  { time: "08:00", value: 3 },
  { time: "10:00", value: 5 },
  { time: "12:00", value: 4 },
  { time: "14:00", value: 2 },
  { time: "16:00", value: 1 },
  { time: "18:00", value: 3 },
  { time: "20:00", value: 1 },
  { time: "22:00", value: 0 },
];

const apiLogEntries = [
  { 
    id: 1, 
    timestamp: "2024-05-13 14:23:45", 
    endpoint: "/api/transactions", 
    method: "GET", 
    statusCode: 200, 
    responseTime: 189, 
    error: null 
  },
  { 
    id: 2, 
    timestamp: "2024-05-13 14:25:12", 
    endpoint: "/api/forecast", 
    method: "POST", 
    statusCode: 200, 
    responseTime: 1450, 
    error: null 
  },
  { 
    id: 3, 
    timestamp: "2024-05-13 14:28:56", 
    endpoint: "/api/recommendations", 
    method: "POST", 
    statusCode: 200, 
    responseTime: 980, 
    error: null 
  },
  { 
    id: 4, 
    timestamp: "2024-05-13 14:30:22", 
    endpoint: "/api/users/profile", 
    method: "PATCH", 
    statusCode: 200, 
    responseTime: 145, 
    error: null 
  },
  { 
    id: 5, 
    timestamp: "2024-05-13 14:35:46", 
    endpoint: "/api/transactions", 
    method: "POST", 
    statusCode: 500, 
    responseTime: 320, 
    error: "Database connection error" 
  },
  { 
    id: 6, 
    timestamp: "2024-05-13 14:38:10", 
    endpoint: "/api/admin/users", 
    method: "GET", 
    statusCode: 200, 
    responseTime: 220, 
    error: null 
  },
  { 
    id: 7, 
    timestamp: "2024-05-13 14:42:35", 
    endpoint: "/api/login", 
    method: "POST", 
    statusCode: 401, 
    responseTime: 125, 
    error: "Invalid credentials" 
  },
  { 
    id: 8, 
    timestamp: "2024-05-13 14:45:18", 
    endpoint: "/api/admin/ai-models", 
    method: "GET", 
    statusCode: 200, 
    responseTime: 185, 
    error: null 
  },
];

export default function Performance() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("day");
  const { toast } = useToast();

  const { data: performanceData, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/performance", timeRange],
  });

  // System health demo data
  const systemHealth = {
    serverUptime: "14 days, 7 hours, 32 minutes",
    dbConnections: 24,
    activeUsers: 156,
    cpuUsage: 52,
    memoryUsage: 68,
    diskUsage: 43,
    lastRestart: "2024-04-21 03:45:12",
    responseTime: 185,
    errorRate: 1.7,
  };

  function getStatusBadge(statusCode: number) {
    if (statusCode < 300) {
      return <Badge variant="outline" className="bg-success/10 text-success">Success</Badge>;
    } else if (statusCode < 400) {
      return <Badge variant="outline" className="bg-primary/10 text-primary">Redirect</Badge>;
    } else if (statusCode < 500) {
      return <Badge variant="outline" className="bg-warning/10 text-warning">Client Error</Badge>;
    } else {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive">Server Error</Badge>;
    }
  }

  function getResponseTimeClass(time: number) {
    if (time < 300) {
      return "text-success";
    } else if (time < 800) {
      return "text-primary";
    } else if (time < 1200) {
      return "text-warning";
    } else {
      return "text-destructive";
    }
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-background">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-col flex-1 h-screen lg:pl-64 overflow-hidden">
        <AppHeader
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Hiệu suất hệ thống"
        />

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Hiệu suất hệ thống</h1>
              <p className="text-muted-foreground">
                Giám sát hiệu suất và độ ổn định của hệ thống
              </p>
            </div>
            <div className="flex gap-2">
              <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
                <TabsList>
                  <TabsTrigger value="hour">Giờ</TabsTrigger>
                  <TabsTrigger value="day">Ngày</TabsTrigger>
                  <TabsTrigger value="week">Tuần</TabsTrigger>
                  <TabsTrigger value="month">Tháng</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* System health overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.cpuUsage}%</div>
                <div className="mt-2">
                  <Progress value={systemHealth.cpuUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bộ nhớ</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.memoryUsage}%</div>
                <div className="mt-2">
                  <Progress value={systemHealth.memoryUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ổ đĩa</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.diskUsage}%</div>
                <div className="mt-2">
                  <Progress value={systemHealth.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ lỗi</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemHealth.errorRate}%</div>
                <div className="mt-2">
                  <Progress 
                    value={systemHealth.errorRate * 10} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>API Response Time</CardTitle>
                <CardDescription>
                  Thời gian phản hồi trung bình của API (ms)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apiResponseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} ms`, 'Response Time']} 
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Response Time"
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tỉ lệ lỗi</CardTitle>
                <CardDescription>
                  Số lỗi ghi nhận theo thời gian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={errorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} errors`, 'Error Count']} 
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Errors"
                        stroke="#ff0000" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tài nguyên hệ thống</CardTitle>
              <CardDescription>
                Sử dụng CPU và bộ nhớ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cpuUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="CPU Usage (%)"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                    />
                    {memoryUsageData.map((entry, index) => (
                      <Line 
                        key={index}
                        type="monotone" 
                        data={memoryUsageData}
                        dataKey="value" 
                        name="Memory Usage (%)"
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* API Logs */}
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>API Logs</CardTitle>
                <CardDescription>
                  Log các request API gần đây
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Làm mới
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian phản hồi</TableHead>
                      <TableHead>Lỗi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogEntries.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {log.timestamp}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.endpoint}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            log.method === "GET" ? "bg-primary/10 text-primary" :
                            log.method === "POST" ? "bg-success/10 text-success" :
                            log.method === "PATCH" ? "bg-warning/10 text-warning" :
                            log.method === "DELETE" ? "bg-destructive/10 text-destructive" :
                            ""
                          }>{log.method}</Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.statusCode)}
                        </TableCell>
                        <TableCell className={getResponseTimeClass(log.responseTime)}>
                          {log.responseTime}ms
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.error || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}