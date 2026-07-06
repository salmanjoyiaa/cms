import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ContentMS — AI Content Automation Command Center',
    template: '%s | ContentMS',
  },
  description: 'AI-powered content automation for personal branding, blog publishing, and viral short-form video creation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
      <body className="min-h-full font-sans antialiased">
        <TooltipProvider>
          {children}
          <Toaster richColors theme="dark" />
        </TooltipProvider>
      </body>
    </html>
  );
}
