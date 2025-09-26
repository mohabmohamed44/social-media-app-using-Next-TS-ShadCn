"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import ReactQueryProvider from "@/lib/react-query-provider";
import { ThemeProvider } from "@/lib/context/themeContext";
import { ReduxProvider } from "@/lib/redux/reduxProvider";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import "./globals.css";
import "@/styles/theme.css";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@/Components/scrollToTop/scrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const authRoutes = ["/login", "/register"];
  const isAuthPage = authRoutes.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ReduxProvider>
            <ThemeProvider>
              <Toaster position="top-center" />
              {!isAuthPage && <Navbar />}
              {children}
              <ScrollToTop />
              {!isAuthPage && <Footer />}
            </ThemeProvider>
          </ReduxProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
