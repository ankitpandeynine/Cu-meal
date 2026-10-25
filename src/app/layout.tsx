import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CU Meal & Events | Chandigarh University Mess Portal',
  description: 'Daily hostel mess menu, meal schedule, campus feasts, and announcements powered by Gemini AI.',
  keywords: ['CU Meal', 'Hostel Mess Menu', 'Chandigarh University', 'Daily Menu', 'Campus Events'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#e0f7fa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-blue-50 selection:bg-rose-200">
        <div className="mx-auto min-h-screen max-w-md md:max-w-xl lg:max-w-2xl bg-white/70 shadow-2xl shadow-sky-900/5 backdrop-blur-sm border-x border-sky-100/60 relative flex flex-col pb-24">
          {children}
        </div>
      </body>
    </html>
  );
}
