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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, MoreHorizontal, Plus, BrainCircuit, Sparkles, Zap, Sliders, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AIModel } from "@shared/schema";

export default function AIManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("models");
  const { toast } = useToast();

  const { data: aiModels, isLoading } = useQuery<AIModel[]>({
    queryKey: ["/api/admin/ai-models"],
  });

  async function handleActivateModel(modelId: number, active: boolean) {
    try {
      await apiRequest("PATCH", `/api/admin/ai-models/${modelId}`, { isActive: active });
      toast({
        title: active ? "Mô hình đã được kích hoạt" : "Mô hình đã bị tắt",
        description: active 
          ? "Mô hình AI đã được kích hoạt và sẵn sàng sử dụng" 
          : "Mô hình AI đã bị tắt và không còn hoạt động",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-models"] });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái mô hình",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteModel(modelId: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa mô hình này không?")) {
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/admin/ai-models/${modelId}`);
      toast({
        title: "Xóa thành công",
        description: "Mô hình AI đã được xóa khỏi hệ thống",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-models"] });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa mô hình AI",
        variant: "destructive",
      });
    }
  }

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case "classifier":
        return <Zap className="h-4 w-4" />;
      case "forecast":
        return <Sparkles className="h-4 w-4" />;
      case "recommender":
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <Sliders className="h-4 w-4" />;
    }
  };

  const getModelTypeLabel = (type: string) => {
    switch (type) {
      case "classifier":
        return "Phân loại";
      case "forecast":
        return "Dự báo";
      case "recommender":
        return "Gợi ý";
      case "fraud":
        return "Phát hiện gian lận";
      case "market":
        return "Dự báo thị trường";
      default:
        return type;
    }
  };

  const getModelAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-success";
    if (accuracy >= 80) return "text-warning";
    return "text-destructive";
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
          title="Quản lý AI"
        />

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quản lý mô hình AI</h1>
              <p className="text-muted-foreground">
                Quản lý các mô hình AI và thuật toán gợi ý
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="hidden sm:flex" onClick={() => {}}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Cập nhật
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm mô hình
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm mô hình AI mới</DialogTitle>
                    <DialogDescription>
                      Tạo mô hình AI mới để cung cấp dự báo và phân tích tài chính
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-center text-muted-foreground">
                      Chức năng thêm mô hình đang được phát triển
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="models">Mô hình</TabsTrigger>
              <TabsTrigger value="parameters">Tham số</TabsTrigger>
              <TabsTrigger value="history">Lịch sử cập nhật</TabsTrigger>
            </TabsList>

            <TabsContent value="models">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Danh sách mô hình AI</CardTitle>
                  <CardDescription>
                    Quản lý tất cả các mô hình AI trong hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên mô hình</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Phiên bản</TableHead>
                            <TableHead>Độ chính xác</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!aiModels || aiModels.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                Không có mô hình AI nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            aiModels.map((model) => (
                              <TableRow key={model.id}>
                                <TableCell>
                                  <div className="font-medium">{model.modelName}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      {getModelTypeIcon(model.modelType)}
                                      <span>{getModelTypeLabel(model.modelType)}</span>
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{model.modelVersion}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between">
                                      <span className={getModelAccuracyColor(Number(model.accuracy))}>
                                        {model.accuracy}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={Number(model.accuracy)}
                                      className={`h-2 ${
                                        Number(model.accuracy) >= 90
                                          ? "bg-success/20"
                                          : Number(model.accuracy) >= 80
                                          ? "bg-warning/20"
                                          : "bg-destructive/20"
                                      }`}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={model.isActive || false}
                                    onCheckedChange={(checked) => handleActivateModel(model.id, checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Mở menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => { /* view details logic */ }}>
                                        <BrainCircuit className="mr-2 h-4 w-4" />
                                        <span>Xem chi tiết</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => { /* edit model logic */ }}>
                                        <Sliders className="mr-2 h-4 w-4" />
                                        <span>Sửa tham số</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDeleteModel(model.id)}
                                      >
                                        <svg
                                          className="mr-2 h-4 w-4"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth={1.5}
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                          />
                                        </svg>
                                        <span>Xóa mô hình</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters">
              <Card>
                <CardHeader>
                  <CardTitle>Tham số mô hình AI</CardTitle>
                  <CardDescription>
                    Cấu hình và điều chỉnh tham số cho các mô hình AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <div className="text-center max-w-md">
                    <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Tính năng đang phát triển</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chức năng quản lý tham số đang được phát triển và sẽ sớm được cập nhật.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử cập nhật mô hình</CardTitle>
                  <CardDescription>
                    Xem lịch sử thay đổi và cập nhật mô hình AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <div className="text-center max-w-md">
                    <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Tính năng đang phát triển</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chức năng xem lịch sử cập nhật đang được phát triển và sẽ sớm được cập nhật.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}