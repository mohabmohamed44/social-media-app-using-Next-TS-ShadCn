"use client";

import Navbar from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";
import ScrollToTop from "@/shared/components/layout/ScrollToTop";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <ScrollToTop />
      <Footer />
    </>
  );
}
