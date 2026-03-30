import { Package } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#4A90E2] via-[#357ABD] to-[#2868A8] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8 animate-bounce">
          <div className="size-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
            <Package className="size-14 text-[#4A90E2]" />
          </div>
        </div>

        {/* Business Name */}
        <h1 className="text-4xl font-bold text-white mb-3 animate-pulse">
          E&E Sales
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Inventory Management System
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2">
          <div className="size-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="size-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="size-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-white/70 mt-8">
          Plastic Supply Wholesale, Retail, and General Merchandise
        </p>
      </div>
    </div>
  );
}
