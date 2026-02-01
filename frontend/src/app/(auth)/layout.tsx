import { Cloud } from 'lucide-react';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration for desktop */}
      <div className="hidden lg:block fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[32px] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-[#E0E0E0] p-6 sm:p-10 relative z-10">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
            <Cloud className="text-white w-7 h-7" />
          </div>
          <h1 className="text-[#5F6368]">DocSeq</h1>
        </div>

        {children}
      </div>

      {/* Policies */}
      <div className="policies-content">
        <button className="policies-btn">Privacy</button>
        <button className="policies-btn">Terms</button>
        <button className="policies-btn">Help</button>
      </div>
    </div>
  );
};

export default Layout;
