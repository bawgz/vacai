import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
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
          <nav className="bg-white border-gray-200 dark:bg-gray-900 px-24">
            <div className="flex flex-wrap justify-between items-center w-full py-4">
              <a
                href="/"
                className="flex items-center space-x-3 rtl:space-x-reverse"
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  height={50}
                  width={50}
                  className="rounded-full"
                />
                <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">
                  Vacai
                </span>
              </a>
              <div className="flex items-center space-x-6 rtl:space-x-reverse">
                <div className="flex justify-end">
                  <form action={logout}>
                    <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        )}
        {children}
      </body>
    </html>
  );
}
