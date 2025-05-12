# Hướng dẫn chạy FinSmart với MySQL

FinSmart là một ứng dụng quản lý tài chính với giao diện tiếng Việt, tích hợp AI để cung cấp gợi ý và phân tích tài chính thông minh. Dưới đây là hướng dẫn để cài đặt và chạy ứng dụng trên môi trường local sử dụng MySQL.

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MySQL Server (v5.7 trở lên)
- Visual Studio Code (khuyến nghị)

## Các bước cài đặt

### 1. Chuẩn bị cơ sở dữ liệu MySQL

1. Cài đặt MySQL Server từ [trang chủ MySQL](https://dev.mysql.com/downloads/mysql/)
2. Đảm bảo MySQL Server đang chạy
3. Tạo cơ sở dữ liệu mới cho ứng dụng:

```sql
CREATE DATABASE finsmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của dự án với nội dung sau:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mật_khẩu_của_bạn
DB_NAME=finsmart
SESSION_SECRET=khóa_bí_mật_bất_kỳ
```

Thay `mật_khẩu_của_bạn` bằng mật khẩu MySQL thực tế của bạn.

### 3. Cài đặt các gói phụ thuộc

Mở terminal và chạy lệnh:

```
npm install
```

### 4. Khởi tạo cơ sở dữ liệu

Chạy lệnh để tạo các bảng và dữ liệu mẫu:

```
node db/init.js
```

### 5. Khởi động ứng dụng

```
node server/index.js
```

Sau khi khởi động, ứng dụng sẽ chạy tại [http://localhost:5000](http://localhost:5000)

## Cách đơn giản với script tự động

Để đơn giản hóa quá trình, bạn có thể sử dụng script tự động:

- Windows: Chạy file `run-finsmart.bat`
- Linux/MacOS: Chạy lệnh `bash run-finsmart.sh`

Script sẽ tự động:
1. Tạo cơ sở dữ liệu nếu chưa tồn tại
2. Tạo các bảng cần thiết
3. Khởi tạo dữ liệu mẫu
4. Khởi động ứng dụng

## Tài khoản mặc định

Sau khi khởi tạo dữ liệu mẫu, bạn có thể đăng nhập với các tài khoản sau:

1. Tài khoản Admin:
   - Tên đăng nhập: `admin`
   - Mật khẩu: `admin123`

2. Tài khoản người dùng thông thường:
   - Tên đăng nhập: `nguyenthanh`
   - Mật khẩu: `user123`

## Tính năng chính

1. **Quản lý giao dịch**: Theo dõi thu nhập và chi tiêu
2. **Phân tích tài chính**: Biểu đồ, thống kê và xu hướng
3. **Dự báo tài chính**: Dự đoán xu hướng tài chính trong tương lai
4. **Gợi ý thông minh từ AI**: Nhận các gợi ý cá nhân hóa
5. **Quản lý ngân sách**: Thiết lập và theo dõi mục tiêu tài chính

## Cấu trúc dự án

```
FinSmart/
├── client/                 # Mã nguồn frontend (React)
├── db/                     # Kết nối và quản lý cơ sở dữ liệu
│   ├── connection.js       # Kết nối MySQL
│   ├── schema.js           # Cấu trúc cơ sở dữ liệu
│   ├── seed.js             # Dữ liệu mẫu
│   └── init.js             # Khởi tạo cơ sở dữ liệu
├── server/                 # Mã nguồn backend
│   ├── api-controllers/    # Xử lý logic API
│   ├── api-routes.js       # Định nghĩa routes API
│   ├── auth.js             # Xác thực người dùng
│   └── index.js            # Điểm vào của server
├── uploads/                # Thư mục lưu trữ file upload
├── shared/                 # Mã dùng chung giữa client và server
├── .env                    # Biến môi trường (cần tạo)
├── package.json            # Cấu hình dự án
├── run-finsmart.bat        # Script chạy tự động cho Windows
└── run-finsmart.sh         # Script chạy tự động cho Linux/Mac
```

## Debug trong VSCode

Tạo file `.vscode/launch.json` với nội dung:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch FinSmart",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/server/index.js",
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "root",
        "DB_PASSWORD": "mật_khẩu_của_bạn",
        "DB_NAME": "finsmart",
        "SESSION_SECRET": "khóa_bí_mật"
      }
    }
  ]
}
```

Sau đó nhấn F5 để chạy và debug ứng dụng.

## Lưu ý

- Ứng dụng sử dụng tiếng Việt làm ngôn ngữ chính
- Tính năng AI yêu cầu kết nối internet để sử dụng OpenAI API
- Các giao dịch và dữ liệu được lưu trữ cục bộ trong MySQL của bạn

## Hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ với người phát triển hoặc tạo issue trên repository.