#!/bin/bash

echo "===== FinSmart - Ứng dụng quản lý tài chính ====="
echo ""

# Kiểm tra Node.js đã được cài đặt
if ! command -v node &> /dev/null; then
    echo "Không tìm thấy Node.js. Vui lòng cài đặt Node.js trước khi chạy ứng dụng."
    echo "Tải Node.js tại: https://nodejs.org/"
    exit 1
fi

# Kiểm tra MySQL đã được cài đặt
if ! command -v mysql &> /dev/null; then
    echo "Không tìm thấy MySQL. Vui lòng cài đặt MySQL Server trước khi chạy ứng dụng."
    echo "Tải MySQL tại: https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Cài đặt các gói npm nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "Cài đặt các gói phụ thuộc..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Lỗi khi cài đặt gói phụ thuộc."
        exit 1
    fi
fi

# Nhập thông tin kết nối MySQL
DB_HOST="localhost"
DB_USER="root"
read -sp "Nhập mật khẩu MySQL của bạn (user root): " DB_PASSWORD
echo ""
DB_NAME="finsmart"
SESSION_SECRET="finsmartsecret123"

# Tạo cơ sở dữ liệu nếu chưa tồn tại
echo "Đang tạo cơ sở dữ liệu..."
mysql -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if [ $? -ne 0 ]; then
    echo "Lỗi khi tạo cơ sở dữ liệu. Kiểm tra lại thông tin kết nối MySQL."
    exit 1
fi

# Ghi thông tin vào file .env
echo "Đang tạo file .env..."
cat > .env << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
SESSION_SECRET=$SESSION_SECRET
EOF

# Khởi tạo cơ sở dữ liệu
echo "Đang khởi tạo cơ sở dữ liệu..."
node db/init.js
if [ $? -ne 0 ]; then
    echo "Lỗi khi khởi tạo cơ sở dữ liệu."
    exit 1
fi

# Khởi động ứng dụng
echo ""
echo "===== Khởi động FinSmart ====="
echo "Truy cập ứng dụng tại http://localhost:5000"
echo "Để dừng ứng dụng, nhấn Ctrl+C"
echo ""

node server/index.js