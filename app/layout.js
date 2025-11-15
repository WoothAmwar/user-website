import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { Header } from "@/app/components/Header"

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

export const metadata = {
  title: "LinkPluck",
  description: "Links Plucked from people worldwide",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} theme-website`}>
        <div className="min-h-screen bg-theme-body text-theme-text">
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-16">
            {children}
          </main>
          <Analytics />
        </div>
      </body>
    </html>
  );
}
