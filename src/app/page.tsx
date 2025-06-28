"use client";
import PrivateRoute from "@/routes/private/private.route";
import { Poppins } from "next/font/google";
import { useTheme } from "@/lib/context/themeContext";
import "@/styles/theme.css";
import { useEffect } from "react";
import { Button } from "@/Components/ui/button";
import Link from "next/link";
import { Sparkles, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  const { theme } = useTheme();
  useEffect(() => {
    // set the data-theme attrobute on <html> element
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <PrivateRoute>
      <motion.div
        className={`${poppins.className} flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-blue-900 dark:text-white`}
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl text-center mt-10 font-extrabold tracking-tight drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Welcome to LinkedPosts!
        </motion.h1>
        <motion.h4
          className="text-lg sm:text-xl md:text-2xl text-center mt-5 font-semibold text-gray-700 dark:text-gray-200 max-w-2xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Connect, share, and discover amazing stories from people around the
          world.
        </motion.h4>
        <motion.p
          className="text-sm sm:text-base md:text-lg text-center mt-2 text-gray-500 dark:text-gray-300 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Dive into trending posts or create your own adventure.
        </motion.p>
        <motion.div
          className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8 w-full px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button className="flex items-center gap-2 px-6 py-6 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-lg transition-all duration-200 text-base sm:text-lg font-semibold w-full md:w-auto">
              <Sparkles className="w-5 h-5" />
              <Link href="/post" className="text-white">
                Explore Trending Posts
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button className="flex items-center gap-2 px-6 py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-all duration-200 text-base sm:text-lg font-semibold w-full md:w-auto">
              <PlusCircle className="w-5 h-5" />
              <Link href="/post/new" className="text-white">
                Create Your Own Post
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </PrivateRoute>
  );
}
