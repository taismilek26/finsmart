import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  amount: z.coerce.number()
    .positive({ message: "Số tiền phải là số dương" }),
  type: z.enum(["income", "expense"], {
    required_error: "Vui lòng chọn loại giao dịch",
  }),
  category: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
  date: z.date({
    required_error: "Vui lòng chọn ngày giao dịch",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const incomeCategories = [
  { label: "Lương", value: "salary" },
  { label: "Đầu tư", value: "investment" },
  { label: "Tiền thưởng", value: "bonus" },
  { label: "Quà tặng", value: "gift" },
  { label: "Khác", value: "other_income" },
];

const expenseCategories = [
  { label: "Ăn uống", value: "food" },
  { label: "Nhà ở", value: "housing" },
  { label: "Di chuyển", value: "transportation" },
  { label: "Giải trí", value: "entertainment" },
  { label: "Mua sắm", value: "shopping" },
  { label: "Sức khỏe", value: "health" },
  { label: "Giáo dục", value: "education" },
  { label: "Khác", value: "other_expense" },
];

interface TransactionFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<FormValues>;
  isEdit?: boolean;
  transactionId?: number;
}

export function TransactionForm({
  onSuccess,
  defaultValues,
  isEdit = false,
  transactionId,
}: TransactionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      date: new Date(),
      description: "",
      ...defaultValues,
    },
  });

  const type = form.watch("type");

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      if (isEdit && transactionId) {
        await apiRequest("PATCH", `/api/transactions/${transactionId}`, values);
        toast({
          title: "Cập nhật thành công",
          description: "Giao dịch đã được cập nhật thành công.",
        });
      } else {
        await apiRequest("POST", "/api/transactions", values);
        toast({
          title: "Thêm giao dịch thành công",
          description: "Giao dịch mới đã được thêm vào hệ thống.",
        });
        form.reset({
          type: "expense",
          amount: 0,
          category: "",
          date: new Date(),
          description: "",
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xử lý giao dịch. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại giao dịch</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giao dịch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Thu nhập</SelectItem>
                  <SelectItem value="expense">Chi tiêu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền (VNĐ)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập số tiền"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "0" : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Nhập số tiền không có dấu phân cách hàng nghìn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {type === "income"
                    ? incomeCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))
                    : expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày giao dịch</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    locale={vi}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả chi tiết về giao dịch (không bắt buộc)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : isEdit ? "Cập nhật giao dịch" : "Thêm giao dịch"}
        </Button>
      </form>
    </Form>
  );
}
