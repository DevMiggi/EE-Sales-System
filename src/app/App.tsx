import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { SalesTransaction } from "./components/SalesTransaction";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!user) {
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  if (user.role === "admin") {
    return (
      <div className="size-full bg-gray-100">
        <Dashboard />
      </div>
    );
  }

  if (user.role === "cashier") {
    return (
      <div className="size-full bg-gray-100">
        <SalesTransaction />
      </div>
    );
  }

  return <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}