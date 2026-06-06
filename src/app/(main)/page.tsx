"use client";

import PrivateRoute from "@/features/auth/guards/PrivateRoute";
import { Poppins } from "next/font/google";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { Sparkles, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function Home() {
  return (
    <PrivateRoute>
      <motion.div
        className={`${poppins.className} flex flex-col items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300`}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1 className="text-3xl sm:text-5xl text-center mt-10 font-extrabold">
          Welcome to LinkedPosts!
        </motion.h1>
        <motion.h4 className="text-lg sm:text-2xl text-center mt-5 font-semibold max-w-2xl">
          Connect, share, and discover amazing stories from people around the
          world.
        </motion.h4>
        <motion.div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8 w-full px-4">
          <Button className="flex items-center gap-2 px-6 py-6 bg-blue-700 text-white rounded-xl" asChild>
            <Link href="/post">
              <Sparkles className="w-5 h-5" />
              Explore Trending Posts
            </Link>
          </Button>
          <Button className="flex items-center gap-2 px-6 py-6 bg-green-600 text-white rounded-xl" asChild>
            <Link href="/post/new">
              <PlusCircle className="w-5 h-5" />
              Create Your Own Post
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </PrivateRoute>
  );
}
