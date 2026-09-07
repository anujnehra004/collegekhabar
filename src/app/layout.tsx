import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'Campus Connect — Your Campus. Your Community. Your Events.',
  description:
    'The central digital campus community platform where students discover upcoming university events, clubs, workshops, hackathons, and opportunities.',
  keywords: 'campus events, college hackathons, university clubs, student networking, tech fest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full flex flex-col antialiased text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950">
        <ToastProvider>
          <AuthProvider>
            <EventProvider>
              <NotificationProvider>
                <Navbar />
                <main className="flex-1 pb-16 md:pb-0">{children}</main>
                <Footer />
                <MobileNav />
              </NotificationProvider>
            </EventProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
