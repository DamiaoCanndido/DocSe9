import { getMe } from '@/app/api/users';
import { Sidebar } from '@/components/Sidebar';
import React from 'react';
import { Navbar } from '@/components/Navbar';
import FileUploader from '@/components/FileUploader';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser: UserResProps = await getMe();
  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] dark:bg-black text-[#1F1F1F] dark:text-zinc-100 overflow-hidden transition-colors duration-300">
      <Sidebar currentUser={currentUser} />

      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar currentUser={currentUser} />
        {children}
      </div>
      <FileUploader />
    </div>
  );
};

export default Layout;
