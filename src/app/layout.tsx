import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GitHub Receipt",
  description: "Generate a receipt-style summary of your GitHub profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" 
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased
                       bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                       min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeToggle />
          <main className="flex-1 pb-16">
            {children}
          </main>
          <footer className="py-3 text-center fixed bottom-0 w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
            <a 
              href="https://bit.ly/3CKBEGE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900
                        hover:bg-zinc-800 dark:hover:bg-zinc-100
                        transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              Use Mira Network to ship AI products quickly
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
