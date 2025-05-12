import { Router } from 'express';
import { requireAuth, requireAdmin } from './auth.js';
import transactionController from './api-controllers/transaction-controller.js';
import userController from './api-controllers/user-controller.js';
import analysisController from './api-controllers/analysis-controller.js';
import aiController from './api-controllers/ai-controller.js';

// Hàm đăng ký các route API vào ứng dụng Express
export function registerRoutes(app) {
  const router = Router();
  
  // Tiền tố cho tất cả các API
  const apiPrefix = '/api';
  
  // === API không cần xác thực ===

  // API danh mục (không cần đăng nhập)
  router.get('/categories', transactionController.getCategories);

  // === API cần xác thực ===

  // API giao dịch
  router.get('/transactions', requireAuth, transactionController.getUserTransactions);
  router.get('/transactions/:id', requireAuth, transactionController.getTransaction);
  router.post('/transactions', requireAuth, transactionController.createTransaction);
  router.put('/transactions/:id', requireAuth, transactionController.updateTransaction);
  router.delete('/transactions/:id', requireAuth, transactionController.deleteTransaction);

  // API người dùng
  router.get('/profile', requireAuth, userController.getUserProfile);
  router.put('/profile', requireAuth, userController.updateUserProfile);
  router.post('/change-password', requireAuth, userController.changePassword);

  // API phân tích tài chính
  router.get('/analysis', requireAuth, analysisController.getFinancialAnalysis);

  // API AI
  router.get('/ai/recommendations', requireAuth, aiController.getAIRecommendations);
  router.get('/ai/forecast', requireAuth, aiController.generateForecast);
  router.put('/ai/recommendations/:id/read', requireAuth, aiController.markRecommendationAsRead);

  // === API chỉ dành cho admin ===

  // API quản lý người dùng (admin)
  router.get('/admin/users', requireAdmin, userController.getAllUsers);
  router.put('/admin/users/:id', requireAdmin, userController.updateUser);
  router.post('/admin/users/:id/reset-password', requireAdmin, userController.resetUserPassword);

  // API quản lý AI (admin)
  router.get('/admin/ai/models', requireAdmin, aiController.getAIModels);
  router.get('/admin/ai/models/:id', requireAdmin, aiController.getAIModel);
  router.put('/admin/ai/models/:id', requireAdmin, aiController.updateAIModel);

  // Đăng ký router vào ứng dụng Express
  app.use(apiPrefix, router);
  
  return app;
}

// Xuất router cho trường hợp sử dụng khác
export default Router;