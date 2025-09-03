import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyTimer - Focus & Break Cycles",
  description: "Automate your study sessions with timed breaks to prevent burnout",
};

import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { SessionProvider } from '../contexts/SessionContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import ProtectedRoute from '../components/ProtectedRoute';
import GlobalTimerCompleteModal from '../components/GlobalTimerCompleteModal';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <SettingsProvider>
            <SessionProvider>
              <TimerProvider>
                <ProtectedRoute>
                  <div className="min-h-screen">
                    {children}
                  </div>
                  <GlobalTimerCompleteModal />
                </ProtectedRoute>
              </TimerProvider>
            </SessionProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
