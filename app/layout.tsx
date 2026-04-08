import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// إعدادات الميتا داتا (العنوان والوصف وأيقونة التبويب)
export const metadata: Metadata = {
  title: "Flash Pay | حوالات مالية بلمح البصر",
  description: "أسرع وأكثر نظام حوالات مالية أماناً في العالم - انتظروا الإطلاق قريباً",
  // هنا نربط شعارك بالتبويب
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // قمنا بتغيير اللغة إلى العربية (ar) واتجاه النص (rtl)
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0E14]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
