import { getMe } from '@/lib/data';
import React from 'react';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const me = await getMe();
  console.log(me);
  return <div>{children}</div>;
};

export default Layout;
