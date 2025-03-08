import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "./components/navbar";
import { ToastProvider } from "@/components/ui/toast";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminUsers from "@/pages/admin/users";
import AccountSettings from "@/pages/account/settings";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/account/settings" component={AccountSettings} />
          <ProtectedRoute path="/admin" component={AdminPage} />
          <ProtectedRoute path="/admin/products" component={AdminProducts} />
          <ProtectedRoute path="/admin/categories" component={AdminCategories} />
          <ProtectedRoute path="/admin/users" component={AdminUsers} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router />
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;