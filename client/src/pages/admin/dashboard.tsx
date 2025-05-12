import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar, AppHeader } from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  Loader2, 
  Users, 
  Activity, 
  CreditCard, 
  DollarSign, 
  BrainCircuit, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  ListChecks
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data
const userGrowthData = [
  { month: "T1", users: 150 },
  { month: "T2", users: 230 },
  { month: "T3", users: 280 },
  { month: "T4", users: 340 },
  { month: "T5", users: 420 },
  { month: "T6", users: 590 },
  { month: "T7", users: 650 },
  { month: "T8", users: 720 },
  { month: "T9", users: 810 },
];

const transactionData = [
  { date: "T1", income: 5400, expense: 3200 },
  { date: "T2", income: 6200, expense: 3800 },
  { date: "T3", income: 7100, expense: 4500 },
  { date: "T4", income: 6800, expense: 4300 },
  { date: "T5", income: 7600, expense: 4800 },
  { date: "T6", income: 8200, expense: 5100 },
  { date: "T7", income: 8900, expense: 5600 },
  { date: "T8", income: 9500, expense: 6000 },
  { date: "T9", income: 10200, expense: 6400 },
];

const modelPerformanceData = [
  { name: "Phân loại giao dịch", value: 92 },
  { name: "Gợi ý tài chính", value: 86 },
  { name: "Dự báo chi tiêu", value: 90 },
  { name: "Phát hiện gian lận", value: 95 },
  { name: "Dự báo thị trường", value: 82 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats", timeRange],
  });

  const demoStats = {
    totalUsers: 810,
    activeUsers: 650,
    totalTransactions: 14250,
    transactionVolume: 1250000,
    averageAccuracy: 89,
    recentRecommendations: 1240,
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-background">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-col flex-1 h-screen lg:pl-64 overflow-hidden">
        <AppHeader
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Dashboard quản trị"
        />

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard quản trị</h1>
              <p className="text-muted-foreground">
                Giám sát và phân tích hoạt động hệ thống
              </p>
            </div>
            <div className="flex gap-2">
              <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
                <TabsList>
                  <TabsTrigger value="week">Tuần</TabsTrigger>
                  <TabsTrigger value="month">Tháng</TabsTrigger>
                  <TabsTrigger value="quarter">Quý</TabsTrigger>
                  <TabsTrigger value="year">Năm</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng người dùng
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success inline-flex items-center mr-1">
                    <ArrowUp className="h-3 w-3 mr-1" /> +12.5%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Giao dịch
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoStats.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success inline-flex items-center mr-1">
                    <ArrowUp className="h-3 w-3 mr-1" /> +8.2%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Khối lượng giao dịch
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(demoStats.transactionVolume / 1000000).toFixed(2)}M ₫</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success inline-flex items-center mr-1">
                    <ArrowUp className="h-3 w-3 mr-1" /> +10.3%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gợi ý AI
                </CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoStats.recentRecommendations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success inline-flex items-center mr-1">
                    <ArrowUp className="h-3 w-3 mr-1" /> +15.8%
                  </span>
                  so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            {/* Usage trend chart */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Tăng trưởng người dùng</CardTitle>
                <CardDescription>
                  Số lượng người dùng mới theo thời gian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI model performance */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Hiệu suất mô hình AI</CardTitle>
                <CardDescription>
                  Độ chính xác của các mô hình AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelPerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {modelPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Transaction chart */}
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng giao dịch</CardTitle>
                <CardDescription>
                  So sánh thu nhập và chi tiêu trong 9 tháng gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" fill="#4CAF50" name="Thu nhập" />
                      <Bar dataKey="expense" fill="#F44336" name="Chi tiêu" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI performance */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê hệ thống</CardTitle>
                <CardDescription>
                  Trạng thái và hiệu suất của hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Độ chính xác trung bình AI</span>
                      </div>
                      <span className="text-sm font-medium">{demoStats.averageAccuracy}%</span>
                    </div>
                    <Progress value={demoStats.averageAccuracy} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Người dùng hoạt động</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(demoStats.activeUsers / demoStats.totalUsers * 100)}%</span>
                    </div>
                    <Progress value={Math.round(demoStats.activeUsers / demoStats.totalUsers * 100)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Tải hệ thống</span>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Tỷ lệ chuyển đổi</span>
                      </div>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}