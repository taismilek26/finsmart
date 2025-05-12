import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  FilterFn,
  Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMobile } from "@/hooks/use-mobile";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchColumns?: string[]; // Thêm tùy chọn tìm kiếm đa cột
  searchPlaceholder?: string;
}

// Hàm lọc toàn cầu tìm kiếm trong nhiều cột
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Kiểm tra nếu không có giá trị tìm kiếm
  if (value === '') return true;

  const searchValue = String(value).toLowerCase();
  
  try {
    const cellValue = String(row.getValue(columnId) || '').toLowerCase();
    // Kiểm tra nếu giá trị ô chứa chuỗi tìm kiếm
    return cellValue.includes(searchValue);
  } catch (e) {
    console.error("Error filtering:", e);
    return false;
  }
};

// Hàm lọc đặc biệt cho phép tìm kiếm trong nhiều cột
function createMultiColumnFilter(columns: string[]): FilterFn<any> {
  return (row: Row<any>, id: string, filterValue: string) => {
    const value = filterValue.toLowerCase();
    if (!value) return true;
    
    // Kiểm tra tất cả các cột được chỉ định
    return columns.some(column => {
      try {
        const cellValue = String(row.getValue(column) || '').toLowerCase();
        return cellValue.includes(value);
      } catch (e) {
        return false;
      }
    });
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchColumns = [], // Mặc định là mảng rỗng nếu không được cung cấp
  searchPlaceholder = "Tìm kiếm...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const isMobile = useMobile();

  // Nếu chỉ có một cột tìm kiếm được cung cấp qua searchColumn, thêm vào searchColumns
  const effectiveSearchColumns = useMemo(() => {
    return searchColumns.length > 0 
      ? searchColumns 
      : (searchColumn ? [searchColumn] : []);
  }, [searchColumn, searchColumns]);

  // Tạo bộ lọc đa cột tùy chỉnh
  const multiColumnFilter = useMemo(() => {
    return createMultiColumnFilter(effectiveSearchColumns);
  }, [effectiveSearchColumns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
      multiColumn: multiColumnFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: multiColumnFilter, // Sử dụng bộ lọc đa cột đã định nghĩa
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Xử lý tìm kiếm khi người dùng nhập
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Chỉ cần thiết lập bộ lọc toàn cục
    // Bộ lọc đa cột của chúng ta sẽ xử lý việc tìm kiếm trên tất cả các cột cần thiết
    setGlobalFilter(value);
  };

  return (
    <div>
      {(searchColumn || effectiveSearchColumns.length > 0) && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} dòng
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
