import type { Metadata } from 'next';
import { Special_Elite } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  style: 'normal',
  variable: '--font-special-elite',
});

export const metadata: Metadata = {
  title: 'Docse9',
  description: 'DocSe9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${specialElite.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>{children}</AppProvider>
          <Toaster
            position="top-right"
            expand={false}
            richColors
            toastOptions={{
              classNames: {
                error:
                  'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-50',
                success:
                  'bg-green border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-50',
                warning:
                  'bg-yellow border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-50',
                info: 'bg-blue border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-50',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
