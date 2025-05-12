import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const paramSchema = z.object({
  modelName: z.string().min(1, { message: "Tên mô hình không được để trống" }),
  modelVersion: z.string().min(1, { message: "Phiên bản không được để trống" }),
  modelType: z.enum(["forecast", "classifier", "recommender", "fraud", "market"], {
    required_error: "Vui lòng chọn loại mô hình",
  }),
  learningRate: z.coerce.number()
    .min(0.0001, { message: "Tối thiểu là 0.0001" })
    .max(1, { message: "Tối đa là 1" }),
  batchSize: z.coerce.number()
    .int({ message: "Phải là số nguyên" })
    .min(1, { message: "Tối thiểu là 1" })
    .max(1024, { message: "Tối đa là 1024" }),
  epochs: z.coerce.number()
    .int({ message: "Phải là số nguyên" })
    .min(1, { message: "Tối thiểu là 1" }),
  riskTolerance: z.coerce.number()
    .min(0, { message: "Tối thiểu là 0" })
    .max(100, { message: "Tối đa là 100" }),
  forecastHorizon: z.coerce.number()
    .int({ message: "Phải là số nguyên" })
    .min(1, { message: "Tối thiểu là 1" })
    .max(24, { message: "Tối đa là 24" }),
  isActive: z.boolean().default(false),
});

type ParamValues = z.infer<typeof paramSchema>;

interface AIParamsFormProps {
  defaultValues?: Partial<ParamValues>;
  isEdit?: boolean;
  modelId?: number;
  onSuccess?: () => void;
}

export function AIParamsForm({
  defaultValues,
  isEdit = false,
  modelId,
  onSuccess,
}: AIParamsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParamValues>({
    resolver: zodResolver(paramSchema),
    defaultValues: {
      modelName: "",
      modelVersion: "1.0.0",
      modelType: "forecast",
      learningRate: 0.001,
      batchSize: 32,
      epochs: 50,
      riskTolerance: 50,
      forecastHorizon: 6,
      isActive: false,
      ...defaultValues,
    },
  });

  async function onSubmit(values: ParamValues) {
    setIsSubmitting(true);
    try {
      if (isEdit && modelId) {
        await apiRequest("PATCH", `/api/ai-models/${modelId}`, values);
        toast({
          title: "Cập nhật thành công",
          description: "Tham số mô hình AI đã được cập nhật thành công.",
        });
      } else {
        await apiRequest("POST", "/api/ai-models", values);
        toast({
          title: "Thêm mô hình thành công",
          description: "Mô hình AI mới đã được thêm vào hệ thống.",
        });
        form.reset({
          modelName: "",
          modelVersion: "1.0.0",
          modelType: "forecast",
          learningRate: 0.001,
          batchSize: 32,
          epochs: 50,
          riskTolerance: 50,
          forecastHorizon: 6,
          isActive: false,
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/ai-models"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const modelType = form.watch("modelType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên mô hình</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên mô hình" {...field} />
                </FormControl>
                <FormDescription>
                  Tên dễ nhớ cho mô hình AI
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelVersion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phiên bản</FormLabel>
                <FormControl>
                  <Input placeholder="vd: 1.0.0" {...field} />
                </FormControl>
                <FormDescription>
                  Phiên bản theo định dạng semver (x.y.z)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="forecast">Dự báo thu chi</SelectItem>
                  <SelectItem value="classifier">Phân loại giao dịch</SelectItem>
                  <SelectItem value="recommender">Gợi ý đầu tư</SelectItem>
                  <SelectItem value="fraud">Phát hiện gian lận</SelectItem>
                  <SelectItem value="market">Dự báo thị trường</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />
        <h3 className="text-lg font-medium">Siêu tham số</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="learningRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tốc độ học (Learning Rate)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="1"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Điều chỉnh tốc độ cập nhật mô hình (0.0001 - 1)
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
                    min="1"
                    max="1024"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Số lượng mẫu xử lý trong mỗi lần cập nhật
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="epochs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng epoch</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Số lần huấn luyện trên toàn bộ dữ liệu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {modelType === "recommender" && (
            <FormField
              control={form.control}
              name="riskTolerance"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Mức độ chấp nhận rủi ro</FormLabel>
                  <FormControl>
                    <div className="pt-5">
                      <Slider
                        defaultValue={[value]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => onChange(vals[0])}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Thấp (0) = An toàn | Cao (100) = Rủi ro | Hiện tại: {value}%
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(modelType === "forecast" || modelType === "market") && (
            <FormField
              control={form.control}
              name="forecastHorizon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khoảng thời gian dự báo (tháng)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Số tháng dự báo trong tương lai (1-24)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Kích hoạt mô hình</FormLabel>
                <FormDescription>
                  Khi được kích hoạt, mô hình sẽ được sử dụng trong hệ thống.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang xử lý..."
            : isEdit
            ? "Cập nhật mô hình"
            : "Thêm mô hình AI"}
        </Button>
      </form>
    </Form>
  );
}
