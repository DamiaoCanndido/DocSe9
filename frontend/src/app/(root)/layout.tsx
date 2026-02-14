import { getMe } from '@/lib/data';
import { Sidebar } from '@/components/Sidebar';
import React from 'react';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/Navbar';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const me = await getMe();
  console.log(me);
  return (
    <div className="flex h-screen w-full bg-#F8F9FA text-#1F1F1F overflow-hidden">
      <Toaster position="bottom-right" />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export default Layout;
