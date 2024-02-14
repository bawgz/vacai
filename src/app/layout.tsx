import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { isUserSignedIn, logout } from "@/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vacai",
  description: "Document your vacations with AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = await isUserSignedIn();

  return (
    <html
      lang="en"
      className="bg-gray-50 text dark:bg-gray-900 font-medium text-gray-900 dark:text-white"
    >
      <body>
        {isLoggedIn && (
          <div className="flex justify-end">
            <form action={logout}>
              <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                Logout
              </button>
            </form>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
