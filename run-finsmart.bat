@echo off
setlocal enabledelayedexpansion

echo ===== FinSmart - Ung dung quan ly tai chinh =====
echo.

REM Kiem tra Node.js da duoc cai dat
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Khong tim thay Node.js. Vui long cai dat Node.js truoc khi chay ung dung.
    echo Tai Node.js tai: https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra MySQL da duoc cai dat
where mysql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Khong tim thay MySQL. Vui long cai dat MySQL Server truoc khi chay ung dung.
    echo Tai MySQL tai: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

REM Cai dat cac goi npm neu chua co
if not exist node_modules (
    echo Cai dat cac goi phu thuoc...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Loi khi cai dat goi phu thuoc.
        pause
        exit /b 1
    )
)

REM Nhap thong tin ket noi MySQL
set DB_HOST=localhost
set DB_USER=root
set /p DB_PASSWORD=Nhap mat khau MySQL cua ban (user root): 
set DB_NAME=finsmart
set SESSION_SECRET=finsmartsecret123

REM Tao co so du lieu neu chua ton tai
echo Dang tao co so du lieu...
mysql -u%DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% neq 0 (
    echo Loi khi tao co so du lieu. Kiem tra lai thong tin ket noi MySQL.
    pause
    exit /b 1
)

REM Ghi thong tin vao file .env
echo Dang tao file .env...
echo DB_HOST=%DB_HOST%> .env
echo DB_USER=%DB_USER%>> .env
echo DB_PASSWORD=%DB_PASSWORD%>> .env
echo DB_NAME=%DB_NAME%>> .env
echo SESSION_SECRET=%SESSION_SECRET%>> .env

REM Khoi tao co so du lieu
echo Dang khoi tao co so du lieu...
call node db/init.js
if %ERRORLEVEL% neq 0 (
    echo Loi khi khoi tao co so du lieu.
    pause
    exit /b 1
)

REM Khoi dong ung dung
echo.
echo ===== Khoi dong FinSmart =====
echo Truy cap ung dung tai http://localhost:5000
echo De dung ung dung, nhan Ctrl+C
echo.

call node server/index.js
pause