import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  BrainCircuit,
  Sliders,
  Upload,
  RefreshCw,
  Zap,
  Play,
  Save,
  FilePlus,
  BarChart4,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  History,
  Settings,
  FileCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AIModel } from "@shared/schema";

// Defining the schema for model parameters
const parameterSchema = z.object({
  modelId: z.number(),
  modelName: z.string().min(1, { message: "Tên mô hình không được để trống" }),
  modelType: z.string().min(1, { message: "Loại mô hình không được để trống" }),
  learningRate: z.coerce.number().min(0.001).max(1),
  epochs: z.coerce.number().int().min(1).max(1000),
  batchSize: z.coerce.number().int().min(1).max(1000),
  dropout: z.coerce.number().min(0).max(0.9),
  optimizerType: z.string(),
  activationFunction: z.string(),
  layers: z.coerce.number().int().min(1).max(20),
  neuronsPerLayer: z.coerce.number().int().min(1).max(1000),
  useTimeSeriesData: z.boolean().default(true),
  useTransactionalData: z.boolean().default(true),
  useMarketData: z.boolean().default(false),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type ParameterValues = z.infer<typeof parameterSchema>;

const ruleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Tên luật không được để trống" }),
  condition: z.string().min(1, { message: "Điều kiện không được để trống" }),
  action: z.string().min(1, { message: "Hành động không được để trống" }),
  priority: z.coerce.number().int().min(1).max(100),
  isActive: z.boolean().default(true),
});

type RuleValues = z.infer<typeof ruleSchema>;

const SAMPLE_TEST_DATA = {
  transactions: [
    { id: 1, type: "income", amount: 8000000, date: "2025-04-10", category: "salary" },
    { id: 2, type: "expense", amount: 1500000, date: "2025-04-12", category: "housing" },
    { id: 3, type: "expense", amount: 500000, date: "2025-04-15", category: "food" },
    { id: 4, type: "expense", amount: 300000, date: "2025-04-18", category: "transportation" },
    { id: 5, type: "expense", amount: 1200000, date: "2025-04-20", category: "shopping" },
    { id: 6, type: "expense", amount: 400000, date: "2025-04-25", category: "entertainment" },
    { id: 7, type: "income", amount: 2000000, date: "2025-04-26", category: "bonus" },
  ],
  historicalData: {
    savingsRate: [12, 15, 9, 10, 14, 13],
    expenseRatio: [68, 65, 72, 70, 66, 67]
  }
};

const SAMPLE_RESULTS = [
  {
    id: 1,
    type: "primary",
    title: "Tối ưu hóa chi tiêu hàng tháng",
    content: "Bạn đang chi tiêu khoảng 45% thu nhập cho nhà ở và thực phẩm. Hãy xem xét giảm chi tiêu thực phẩm bằng cách nấu ăn tại nhà nhiều hơn, tiết kiệm thêm 300-500k mỗi tháng."
  },
  {
    id: 2,
    type: "success",
    title: "Tiết kiệm cho tương lai",
    content: "Với mức thu nhập hiện tại, bạn nên tiết kiệm ít nhất 20% (2 triệu đồng/tháng) vào quỹ khẩn cấp và quỹ đầu tư dài hạn."
  },
  {
    id: 3,
    type: "warning",
    title: "Cảnh báo mua sắm",
    content: "Chi tiêu cho mua sắm trong tháng này đã tăng 25% so với tháng trước. Hãy theo dõi khoản chi này trong tháng tới."
  }
];

export default function AIParameters() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("parameters");
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rules, setRules] = useState<RuleValues[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<RuleValues | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [updateHistory, setUpdateHistory] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: aiModels, isLoading: isLoadingModels } = useQuery<AIModel[]>({
    queryKey: ["/api/admin/ai-models"],
  });

  // Form for model parameters
  const form = useForm<ParameterValues>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      modelId: 0,
      modelName: "",
      modelType: "recommender",
      learningRate: 0.01,
      epochs: 100,
      batchSize: 32,
      dropout: 0.2,
      optimizerType: "adam",
      activationFunction: "relu",
      layers: 3,
      neuronsPerLayer: 64,
      useTimeSeriesData: true,
      useTransactionalData: true,
      useMarketData: false,
      description: "",
      notes: ""
    }
  });

  // Form for rule-based logic
  const ruleForm = useForm<RuleValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      condition: "",
      action: "",
      priority: 1,
      isActive: true
    }
  });

  // Reset form when selected model changes
  useEffect(() => {
    if (selectedModel && aiModels) {
      const model = aiModels.find(m => m.id === selectedModel);
      if (model) {
        // If model has parameters stored in JSON format, parse them
        let parameters: any = {};
        try {
          if (model.parameters && typeof model.parameters === 'string') {
            parameters = JSON.parse(model.parameters as string);
          }
        } catch (e) {
          console.error("Failed to parse model parameters", e);
        }

        form.reset({
          modelId: model.id,
          modelName: model.modelName,
          modelType: model.modelType,
          learningRate: parameters.learningRate || 0.01,
          epochs: parameters.epochs || 100,
          batchSize: parameters.batchSize || 32,
          dropout: parameters.dropout || 0.2,
          optimizerType: parameters.optimizerType || "adam",
          activationFunction: parameters.activationFunction || "relu",
          layers: parameters.layers || 3,
          neuronsPerLayer: parameters.neuronsPerLayer || 64,
          useTimeSeriesData: parameters.useTimeSeriesData !== undefined ? parameters.useTimeSeriesData : true,
          useTransactionalData: parameters.useTransactionalData !== undefined ? parameters.useTransactionalData : true,
          useMarketData: parameters.useMarketData !== undefined ? parameters.useMarketData : false,
          description: "",
          notes: parameters.notes || ""
        });

        // If model has rules, load them
        if (parameters.rules) {
          setRules(parameters.rules);
        } else {
          setRules([]);
        }

        // Load update history if available
        if (parameters.updateHistory) {
          setUpdateHistory(parameters.updateHistory);
        } else {
          // Set some sample history data if not available
          setUpdateHistory([
            {
              id: 1,
              date: "2025-04-01 10:30:25",
              user: "admin",
              changes: "Cập nhật tham số ban đầu",
              accuracy: 85.2
            },
            {
              id: 2,
              date: "2025-04-15 14:22:18",
              user: "admin",
              changes: "Điều chỉnh learning rate từ 0.02 xuống 0.01",
              accuracy: 87.4
            }
          ]);
        }
      }
    }
  }, [selectedModel, aiModels, form]);

  // Mutation for saving parameters
  const saveParametersMutation = useMutation({
    mutationFn: async (data: ParameterValues) => {
      // Add rules to the parameters
      const parameters = {
        ...data,
        rules,
        updateHistory: [
          {
            id: updateHistory.length + 1,
            date: new Date().toISOString(),
            user: "admin",
            changes: "Cập nhật tham số mô hình",
            accuracy: 85 + Math.random() * 10 // Simulated accuracy improvement
          },
          ...updateHistory
        ]
      };

      // Convert to JSON string for storage
      const parametersJson = JSON.stringify(parameters);

      // Update the AI model in the database
      const res = await apiRequest("PATCH", `/api/admin/ai-models/${data.modelId}`, {
        parameters: parametersJson,
        modelName: data.modelName,
        modelType: data.modelType
      });

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Lưu thành công",
        description: "Tham số mô hình AI đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-models"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật tham số: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation for uploading model
  const uploadModelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modelId", selectedModel?.toString() || "");

      const res = await fetch(`/api/admin/ai-models/${selectedModel}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tải lên thành công",
        description: "Mô hình AI đã được tải lên thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-models"] });
      setUploadedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: `Không thể tải lên mô hình: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Simulated function for testing model with parameters
  const simulateModel = () => {
    setIsSimulating(true);
    // Simulate API call delay
    setTimeout(() => {
      setSimulationResults(SAMPLE_RESULTS);
      setIsSimulating(false);
      toast({
        title: "Mô phỏng hoàn tất",
        description: "Đã hoàn thành mô phỏng với dữ liệu giả lập",
      });
    }, 2000);
  };

  const addOrUpdateRule = (rule: RuleValues) => {
    if (rule.id) {
      // Update existing rule
      setRules(rules.map(r => r.id === rule.id ? rule : r));
    } else {
      // Add new rule with generated ID
      setRules([...rules, { ...rule, id: Date.now() }]);
    }
    setRuleDialogOpen(false);
    ruleForm.reset();
  };

  const deleteRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const editRule = (rule: RuleValues) => {
    setCurrentRule(rule);
    ruleForm.reset(rule);
    setRuleDialogOpen(true);
  };

  const onSubmit = (data: ParameterValues) => {
    saveParametersMutation.mutate(data);
  };

  const onRuleSubmit = (data: RuleValues) => {
    addOrUpdateRule(currentRule ? { ...data, id: currentRule.id } : data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (uploadedFile && selectedModel) {
      uploadModelMutation.mutate(uploadedFile);
    }
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
          title="Tham số mô hình AI"
        />

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Cập nhật thuật toán gợi ý AI</h1>
              <p className="text-muted-foreground">
                Quản lý, cập nhật và tinh chỉnh các mô hình AI và tham số
              </p>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedModel?.toString() || ""}
                onValueChange={(value) => setSelectedModel(parseInt(value))}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Chọn mô hình AI" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingModels ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    aiModels?.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.modelName} - {model.modelType}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedModel(null);
                  form.reset();
                  setRules([]);
                }}
              >
                <FilePlus className="mr-2 h-4 w-4" />
                Mô hình mới
              </Button>
            </div>
          </div>

          {selectedModel || true ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="parameters">
                  <Sliders className="mr-2 h-4 w-4" />
                  Tham số
                </TabsTrigger>
                <TabsTrigger value="rules">
                  <FileCode className="mr-2 h-4 w-4" />
                  Luật gợi ý
                </TabsTrigger>
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên mô hình
                </TabsTrigger>
                <TabsTrigger value="simulation">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Kiểm thử
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  Lịch sử cập nhật
                </TabsTrigger>
              </TabsList>

              {/* Parameters tab */}
              <TabsContent value="parameters">
                <Card>
                  <CardHeader>
                    <CardTitle>Thiết lập tham số mô hình AI</CardTitle>
                    <CardDescription>
                      Tinh chỉnh tham số cho mô hình AI để tối ưu hóa hiệu suất
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="modelName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tên mô hình</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="modelType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Loại mô hình</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại mô hình" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="recommender">Gợi ý tài chính</SelectItem>
                                      <SelectItem value="forecast">Dự báo chi tiêu</SelectItem>
                                      <SelectItem value="classifier">Phân loại giao dịch</SelectItem>
                                      <SelectItem value="fraud">Phát hiện gian lận</SelectItem>
                                      <SelectItem value="market">Dự báo thị trường</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="learningRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tốc độ học (Learning Rate): {field.value}</FormLabel>
                                  <FormControl>
                                    <Slider
                                      min={0.001}
                                      max={0.1}
                                      step={0.001}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Tốc độ học càng nhỏ, mô hình hội tụ càng chậm nhưng ổn định hơn
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="epochs"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Số vòng lặp (Epochs)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={1000}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Số lần mô hình được huấn luyện trên tập dữ liệu
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="batchSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kích thước batch</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={1000}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dropout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dropout: {field.value}</FormLabel>
                                  <FormControl>
                                    <Slider
                                      min={0}
                                      max={0.9}
                                      step={0.1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Tỷ lệ dropout để tránh overfitting
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="optimizerType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Thuật toán tối ưu</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn thuật toán" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="adam">Adam</SelectItem>
                                      <SelectItem value="sgd">SGD</SelectItem>
                                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                                      <SelectItem value="adagrad">Adagrad</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="activationFunction"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hàm kích hoạt</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn hàm kích hoạt" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="relu">ReLU</SelectItem>
                                      <SelectItem value="sigmoid">Sigmoid</SelectItem>
                                      <SelectItem value="tanh">Tanh</SelectItem>
                                      <SelectItem value="leaky_relu">Leaky ReLU</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="layers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Số lớp ẩn</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={20}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="neuronsPerLayer"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Số neuron mỗi lớp</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={1000}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="border rounded-md p-4 space-y-4">
                              <h3 className="text-sm font-medium">Nguồn dữ liệu đầu vào</h3>
                              <FormField
                                control={form.control}
                                name="useTransactionalData"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Dữ liệu giao dịch</FormLabel>
                                      <FormDescription>
                                        Sử dụng lịch sử giao dịch của người dùng
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="useTimeSeriesData"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Dữ liệu chuỗi thời gian</FormLabel>
                                      <FormDescription>
                                        Sử dụng xu hướng theo thời gian
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="useMarketData"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Dữ liệu thị trường</FormLabel>
                                      <FormDescription>
                                        Sử dụng dữ liệu thị trường tài chính bên ngoài
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Mô tả chi tiết về mô hình AI và mục đích sử dụng"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ghi chú</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Ghi chú về tham số, điều chỉnh và hiệu suất mô hình"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            type="submit"
                            disabled={saveParametersMutation.isPending}
                          >
                            {saveParametersMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Lưu tham số
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rules tab */}
              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <CardTitle>Luật gợi ý dựa trên quy tắc</CardTitle>
                    <CardDescription>
                      Thiết lập các luật thủ công để bổ sung cho mô hình học máy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Các luật này sẽ được áp dụng kết hợp với kết quả từ mô hình học máy
                      </p>
                      <Button onClick={() => {
                        setCurrentRule(null);
                        ruleForm.reset();
                        setRuleDialogOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm luật
                      </Button>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên luật</TableHead>
                            <TableHead>Điều kiện</TableHead>
                            <TableHead>Hành động</TableHead>
                            <TableHead className="w-[100px]">Độ ưu tiên</TableHead>
                            <TableHead className="w-[80px]">Trạng thái</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rules.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center">
                                Chưa có luật nào được thiết lập
                              </TableCell>
                            </TableRow>
                          ) : (
                            rules.map((rule) => (
                              <TableRow key={rule.id}>
                                <TableCell className="font-medium">{rule.name}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {rule.condition}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {rule.action}
                                </TableCell>
                                <TableCell>{rule.priority}</TableCell>
                                <TableCell>
                                  <Badge variant={rule.isActive ? "outline" : "secondary"}>
                                    {rule.isActive ? "Hoạt động" : "Tắt"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => editRule(rule)}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive"
                                      onClick={() => rule.id && deleteRule(rule.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {currentRule ? "Chỉnh sửa luật" : "Thêm luật mới"}
                          </DialogTitle>
                          <DialogDescription>
                            Thiết lập điều kiện và hành động cho luật gợi ý
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...ruleForm}>
                          <form onSubmit={ruleForm.handleSubmit(onRuleSubmit)} className="space-y-4">
                            <FormField
                              control={ruleForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tên luật</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={ruleForm.control}
                              name="condition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Điều kiện</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ví dụ: savingsRate < 10 AND totalExpense > 0.7 * totalIncome"
                                      className="min-h-[80px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Sử dụng các toán tử: AND, OR, &gt;, &lt;, =, &gt;=, &lt;=
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={ruleForm.control}
                              name="action"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hành động</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ví dụ: Tạo cảnh báo 'Tỷ lệ tiết kiệm thấp' với mức độ 'warning'"
                                      className="min-h-[80px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={ruleForm.control}
                                name="priority"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Độ ưu tiên</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      1-100 (cao hơn = ưu tiên hơn)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={ruleForm.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Kích hoạt luật</FormLabel>
                                      <FormDescription>
                                        Bật/tắt áp dụng luật này
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <DialogFooter>
                              <Button type="submit">
                                {currentRule ? "Cập nhật" : "Thêm luật"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload tab */}
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Tải lên mô hình AI</CardTitle>
                    <CardDescription>
                      Tải lên mô hình AI đã được huấn luyện trước
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border rounded-md p-8 flex flex-col items-center justify-center">
                        <div className="mb-4">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Tải lên mô hình</h3>
                        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                          Kéo thả file mô hình vào đây hoặc nhấp để chọn file.
                          Hỗ trợ các định dạng .h5, .pkl, .onnx hoặc .zip chứa mô hình.
                        </p>
                        <Input
                          id="model-upload"
                          type="file"
                          className="hidden"
                          accept=".h5,.pkl,.onnx,.zip"
                          onChange={handleFileChange}
                        />
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById("model-upload")?.click()}
                          >
                            Chọn file
                          </Button>
                          {uploadedFile && (
                            <Button
                              onClick={handleUpload}
                              disabled={uploadModelMutation.isPending}
                            >
                              {uploadModelMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="mr-2 h-4 w-4" />
                              )}
                              Tải lên
                            </Button>
                          )}
                        </div>
                      </div>

                      {uploadedFile && (
                        <div className="border rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUploadedFile(null)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="rounded-md bg-muted p-4">
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
                          Lưu ý quan trọng
                        </h3>
                        <ul className="text-sm space-y-1 list-disc pl-5">
                          <li>Mô hình phải được huấn luyện với cấu trúc dữ liệu tương thích với hệ thống.</li>
                          <li>Mô hình đã tải lên sẽ thay thế mô hình hiện tại.</li>
                          <li>Nếu có vấn đề, hệ thống sẽ tự động quay lại phiên bản trước.</li>
                          <li>Đảm bảo thực hiện kiểm thử mô hình trước khi triển khai.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Simulation tab */}
              <TabsContent value="simulation">
                <Card>
                  <CardHeader>
                    <CardTitle>Kiểm thử mô hình với dữ liệu giả lập</CardTitle>
                    <CardDescription>
                      Đánh giá hiệu suất của mô hình với dữ liệu mẫu trước khi triển khai
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Dữ liệu kiểm thử</h3>
                        <Button onClick={() => setDialogOpen(true)} variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Tùy chỉnh dữ liệu
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-md border p-4">
                          <h4 className="text-sm font-medium mb-2">Giao dịch mẫu</h4>
                          <div className="overflow-y-auto max-h-[200px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Loại</TableHead>
                                  <TableHead>Số tiền</TableHead>
                                  <TableHead>Danh mục</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {SAMPLE_TEST_DATA.transactions.map(transaction => (
                                  <TableRow key={transaction.id}>
                                    <TableCell>
                                      <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                                        {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{(transaction.amount / 1000000).toFixed(1)}tr</TableCell>
                                    <TableCell>{transaction.category}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <h4 className="text-sm font-medium mb-2">Dữ liệu thống kê</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Tỷ lệ tiết kiệm</span>
                                <span className="text-sm font-medium">13%</span>
                              </div>
                              <Progress value={13} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Tỷ lệ chi tiêu/thu nhập</span>
                                <span className="text-sm font-medium">67%</span>
                              </div>
                              <Progress value={67} className="h-2" />
                            </div>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Tổng thu</span>
                                <p className="font-medium">10tr ₫</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Tổng chi</span>
                                <p className="font-medium">6.7tr ₫</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Tiết kiệm</span>
                                <p className="font-medium">3.3tr ₫</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Danh mục chi lớn nhất</span>
                                <p className="font-medium">Nhà ở (40%)</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        onClick={simulateModel}
                        disabled={isSimulating}
                        size="lg"
                        className="w-full md:w-auto"
                      >
                        {isSimulating ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-5 w-5" />
                        )}
                        Chạy mô phỏng
                      </Button>
                    </div>

                    {simulationResults && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Kết quả mô phỏng</h3>
                        <div className="space-y-4">
                          {simulationResults.map((result: any) => (
                            <Card key={result.id} className={
                              result.type === "primary" ? "bg-primary/5 border-primary/20" :
                              result.type === "success" ? "bg-success/5 border-success/20" :
                              "bg-warning/5 border-warning/20"
                            }>
                              <CardContent className="p-4">
                                <div className="flex items-start">
                                  <div className={`rounded-full p-2 mr-3 ${
                                    result.type === "primary" ? "bg-primary/10 text-primary" :
                                    result.type === "success" ? "bg-success/10 text-success" :
                                    "bg-warning/10 text-warning"
                                  }`}>
                                    {result.type === "primary" ? (
                                      <Zap className="h-5 w-5" />
                                    ) : result.type === "success" ? (
                                      <Check className="h-5 w-5" />
                                    ) : (
                                      <AlertTriangle className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">{result.title}</h4>
                                    <p className="text-sm">{result.content}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <div className="rounded-md bg-muted p-4">
                            <h4 className="text-sm font-medium mb-2">Phân tích hiệu suất mô hình</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground">Độ chính xác</span>
                                <p className="font-medium">89%</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Độ tin cậy</span>
                                <p className="font-medium">85%</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">F1-score</span>
                                <p className="font-medium">0.87</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">Tỉ lệ giả dương</span>
                                <p className="font-medium">0.08</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử cập nhật mô hình AI</CardTitle>
                    <CardDescription>
                      Theo dõi lịch sử thay đổi và phiên bản mô hình
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Người thực hiện</TableHead>
                            <TableHead>Thay đổi</TableHead>
                            <TableHead>Độ chính xác</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {updateHistory.map((update) => (
                            <TableRow key={update.id}>
                              <TableCell>{update.date}</TableCell>
                              <TableCell>{update.user}</TableCell>
                              <TableCell>{update.changes}</TableCell>
                              <TableCell>{update.accuracy.toFixed(1)}%</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Khôi phục
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center my-12 py-12">
              <BrainCircuit className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Chọn mô hình để quản lý</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Vui lòng chọn một mô hình AI hiện có hoặc tạo mô hình mới để bắt đầu quản lý tham số
              </p>
              <Button
                onClick={() => {
                  form.reset({
                    modelId: 0,
                    modelName: "Mô hình mới",
                    modelType: "recommender",
                    learningRate: 0.01,
                    epochs: 100,
                    batchSize: 32,
                    dropout: 0.2,
                    optimizerType: "adam",
                    activationFunction: "relu",
                    layers: 3,
                    neuronsPerLayer: 64,
                    useTimeSeriesData: true,
                    useTransactionalData: true,
                    useMarketData: false,
                    description: "",
                    notes: ""
                  });
                  setActiveTab("parameters");
                  setSelectedModel(0);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo mô hình mới
              </Button>
            </div>
          )}
        </main>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh dữ liệu kiểm thử</DialogTitle>
            <DialogDescription>
              Điều chỉnh dữ liệu mẫu để kiểm thử mô hình AI
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[500px] pr-2">
            <div className="space-y-6">
              <h3 className="text-base font-medium">Giao dịch mẫu</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_TEST_DATA.transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Select defaultValue={transaction.type}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Thu nhập</SelectItem>
                              <SelectItem value="expense">Chi tiêu</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-24"
                            defaultValue={transaction.amount / 1000000}
                          />
                        </TableCell>
                        <TableCell>
                          <Select defaultValue={transaction.category}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="salary">Lương</SelectItem>
                              <SelectItem value="bonus">Thưởng</SelectItem>
                              <SelectItem value="housing">Nhà ở</SelectItem>
                              <SelectItem value="food">Ăn uống</SelectItem>
                              <SelectItem value="transportation">Di chuyển</SelectItem>
                              <SelectItem value="shopping">Mua sắm</SelectItem>
                              <SelectItem value="entertainment">Giải trí</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            className="w-32"
                            defaultValue={transaction.date}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm giao dịch
              </Button>

              <Separator />

              <h3 className="text-base font-medium">Thông số thống kê</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tỷ lệ tiết kiệm (%)</Label>
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    defaultValue={[13]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tỷ lệ chi tiêu/thu nhập (%)</Label>
                  <Slider
                    min={30}
                    max={100}
                    step={1}
                    defaultValue={[67]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tổng thu nhập (triệu đồng)</Label>
                  <Input type="number" defaultValue={10} />
                </div>
                <div className="space-y-2">
                  <Label>Tổng chi tiêu (triệu đồng)</Label>
                  <Input type="number" defaultValue={6.7} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}