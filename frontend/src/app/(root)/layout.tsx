import { getMe } from '@/app/api/users';
import { Sidebar } from '@/components/Sidebar';
import React from 'react';
import { Navbar } from '@/components/Navbar';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser: UserResProps = await getMe();
  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-[#1F1F1F] overflow-hidden">
      <Sidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar currentUser={currentUser} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
