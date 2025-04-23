"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { UserProfile } from "@/components/UserProfile";
import { User, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { BookmarkProvider } from "@/context/BookmarkContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <BookmarkProvider>
          <header className="border-b">
            <div className="container mx-auto p-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">Bookmark Manager</h1>
              {user && (
                <div className="flex items-center gap-4">
                  <UserProfile user={user} />
                </div>
              )}
            </div>
          </header>
          {children}
          <Toaster />
        </BookmarkProvider>
      </body>
    </html>
  );
}
