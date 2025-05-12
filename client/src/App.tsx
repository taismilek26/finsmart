import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Analysis from "@/pages/analysis";
import Forecast from "@/pages/forecast";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import UserDetail from "@/pages/admin/user-detail";
import AIManagement from "@/pages/admin/ai-management";
import AIParameters from "@/pages/admin/ai-parameters";
import Performance from "@/pages/admin/performance";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      {/* Public route - Home page for unauthenticated users */}
      <Route path="/" component={HomePage} />
      
      {/* User routes - Protected, require authentication */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/transactions" component={Transactions} />
      <ProtectedRoute path="/analysis" component={Analysis} />
      <ProtectedRoute path="/forecast" component={Forecast} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/settings" component={Settings} />
      
      {/* Admin routes - Protected and require admin role */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={UserManagement} adminOnly={true} />
      <ProtectedRoute path="/admin/users/:userId" component={UserDetail} adminOnly={true} />
      <ProtectedRoute path="/admin/ai" component={AIManagement} adminOnly={true} />
      <ProtectedRoute path="/admin/ai-parameters" component={AIParameters} adminOnly={true} />
      <ProtectedRoute path="/admin/performance" component={Performance} adminOnly={true} />
      
      {/* Auth route */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="finsmart-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
