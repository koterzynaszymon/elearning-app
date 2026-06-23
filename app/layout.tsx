import type { Metadata } from "next";
import { Bricolage_Grotesque, Nunito } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  display: "swap",
  subsets: ["latin"],
});

const fontSans = Nunito({
  variable: "--font-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumen — Learning, illuminated by AI",
  description:
    "An AI-assisted e-learning platform where instructors build beautiful courses and learners stay on track.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
