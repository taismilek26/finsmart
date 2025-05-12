import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import MySQLSessionStore from 'express-mysql-session';
import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import db from '../db/connection.js';

const scryptAsync = promisify(scrypt);

// So sánh mật khẩu đã hash với mật khẩu người dùng nhập
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Tạo Store cho session
function createSessionStore(options = {}) {
  const MySQLStore = MySQLSessionStore(session);
  
  const storeOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finsmart',
    ...options
  };
  
  return new MySQLStore(storeOptions);
}

// Thiết lập xác thực
export function setupAuth(app) {
  // Thiết lập session
  const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'default_session_secret_change_in_production',
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      httpOnly: true
    }
  };
  
  // Nếu production, đặt cookie secure = true
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionOptions.cookie.secure = true;
  }
  
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Thiết lập Local Strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Tìm người dùng theo username
      const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      const user = users[0];
      
      // Nếu không tìm thấy người dùng hoặc mật khẩu không đúng
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      }
      
      // Xóa mật khẩu khỏi object user
      delete user.password;
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialize/Deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const users = await db.query('SELECT id, username, email, fullName, role FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return done(null, false);
      }
      done(null, users[0]);
    } catch (error) {
      done(error);
    }
  });
  
  // API routes for authentication
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });
  
  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    res.json(req.user);
  });
  
  // API đăng ký người dùng mới
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, password, email, fullName } = req.body;
      
      // Kiểm tra nếu username hoặc email đã tồn tại
      const existingUsers = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          message: 'Tên đăng nhập hoặc email đã tồn tại'
        });
      }
      
      // Mã hóa mật khẩu
      const salt = require('crypto').randomBytes(16).toString('hex');
      const derivedKey = await scryptAsync(password, salt, 64);
      const hashedPassword = `${derivedKey.toString('hex')}.${salt}`;
      
      // Thêm người dùng mới
      const result = await db.query(
        'INSERT INTO users (username, password, email, fullName, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, fullName, 'user']
      );
      
      // Lấy thông tin người dùng vừa tạo
      const newUser = await db.query(
        'SELECT id, username, email, fullName, role FROM users WHERE id = ?',
        [result.insertId]
      );
      
      // Đăng nhập người dùng mới
      req.login(newUser[0], (err) => {
        if (err) return next(err);
        res.status(201).json(newUser[0]);
      });
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    }
  });
}

// Middleware bảo vệ các routes cần xác thực
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Cần đăng nhập để truy cập' });
}

// Middleware chỉ cho phép Admin truy cập
export function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Không có quyền truy cập' });
}

export default {
  setupAuth,
  requireAuth,
  requireAdmin
};