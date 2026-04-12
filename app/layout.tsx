import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "./providers/toast-provider";
import { CartProvider } from "./providers/cart-provider";
import { ToastContainer } from "@/components/toast-container";
import { Header } from "@/components/header";
import { AuthModal } from "@/components/auth-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PC Builder - Xây dựng cấu hình PC của bạn",
  description: "Nền tảng bán PC và xây dựng cấu hình PC trực tuyến với AI tư vấn cấu hình thông minh, kiểm tra tương thích linh kiện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <CartProvider>
            <Header />
            <Suspense fallback={null}>
              <AuthModal />
            </Suspense>
            <ToastContainer />
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
