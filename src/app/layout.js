import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "Bajaj Canteen Operations OS 2.0",
  description: "Enterprise Operational Management & Administration Portal",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090C] text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
