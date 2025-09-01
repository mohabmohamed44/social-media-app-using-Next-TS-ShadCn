"use client";

import { Button } from "@/Components/ui/button";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState, useCallback } from 'react';

// Test component to verify rendering
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const toggleVisibility = useCallback(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;
    
    const shouldBeVisible = window.scrollY > 300;
    setIsVisible(shouldBeVisible);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const options: AddEventListenerOptions = { passive: true };
    window.addEventListener('scroll', toggleVisibility, options);
    
    // Initial check
    toggleVisibility();
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility, options);
    };
  }, [toggleVisibility]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      
      {/* Scroll to top button */}
      <Button 
        onClick={scrollToTop}
        className={`
          px-4 py-4 w-10 h-10 rounded-full shadow-lg transition-all duration-300
          bg-black hover:bg-gray-800 text-white
          transform hover:-translate-y-1
          ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-12 h-12" />
      </Button>
    </div>
    </>
  );
}
