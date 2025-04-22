"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthButton } from "@/components/AuthButton";
import { UserProfile } from "@/components/UserProfile";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookmarkProvider } from "@/context/BookmarkContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <BookmarkProvider>
          <header className="border-b">
            <div className="container mx-auto p-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">Bookmark Manager</h1>
              <div className="flex items-center gap-4">
                <AuthButton />
                {user && <UserProfile user={user} />}
              </div>
            </div>
          </header>
          {children}
          <Toaster />
        </BookmarkProvider>
      </body>
    </html>
  );
}
