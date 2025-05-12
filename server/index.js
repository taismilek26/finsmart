import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import db from '../db/connection.js';
import { setupAuth } from './auth.js';
import { registerRoutes } from './api-routes.js';

// Tải biến môi trường từ file .env
dotenv.config();

// Lấy thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tạo ứng dụng Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
const MySQLStoreSession = MySQLStore(session);
const sessionStore = new MySQLStoreSession({
  // Sử dụng kết nối MySQL đã có
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finsmart',
  // Cấu hình bổ sung
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'finsmart_session_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Cấu hình authentication
setupAuth(app);

// Đăng ký API routes
registerRoutes(app);

// Phục vụ các tệp tĩnh từ thư mục client/dist
app.use(express.static(join(__dirname, '..', 'client', 'dist')));

// Route mặc định cho Single Page Application
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// Khởi động server
async function startServer() {
  try {
    // Kiểm tra kết nối đến cơ sở dữ liệu
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu MySQL');
    }
    console.log('✅ Đã kết nối đến cơ sở dữ liệu MySQL');
    
    // Khởi động server
    app.listen(port, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
      console.log(`📝 API endpoint: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('❌ Lỗi khi khởi động server:', error);
    process.exit(1);
  }
}

// Khởi chạy server
startServer();

// Xử lý tín hiệu tắt server
process.on('SIGINT', async () => {
  console.log('\n🛑 Đang dừng server...');
  try {
    await db.close();
    console.log('📴 Đã đóng kết nối cơ sở dữ liệu');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi đóng kết nối:', error);
    process.exit(1);
  }
});

export default app;