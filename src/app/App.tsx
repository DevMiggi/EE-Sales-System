import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState<string>('');

  const handlePurchase = (itemName: string) => {
    setPurchasedItem(itemName);
    setShowSuggestions(true);
  };

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  // Show login/register if not authenticated
  if (!user) {
    if (showRegister) {
      return <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />;
  }

  // Show dashboard if authenticated
  return (
    <div className="size-full bg-gray-100">
      <Dashboard 
        onPurchase={handlePurchase} 
        showSuggestions={showSuggestions} 
        setShowSuggestions={setShowSuggestions} 
        purchasedItem={purchasedItem} 
      />
    </div>
  );
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