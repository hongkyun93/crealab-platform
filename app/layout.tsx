import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { UnifiedProvider } from "@/components/providers/unified-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CreadyPick | 제품이 필요한 바로 그 순간에 연결합니다",
    template: "%s | CreadyPick",
  },
  description: "크리에이터의 라이프 모먼트(이사, 결혼, 여행 등)에 맞춰 브랜드 제품을 연결하는 세계 유일의 타이밍 매칭 플랫폼. 가입비 무료, 수수료 0%.",
  keywords: ["인플루언서 마케팅", "크리에이터 매칭", "라이프 모먼트", "브랜드 협찬", "체험단", "타이밍 마케팅", "CreadyPick", "크레디픽"],
  authors: [{ name: "CreadyPick Team" }],
  creator: "CreadyPick",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.creadypick.com",
    title: "CreadyPick | 광고는 타이밍이다 🎯",
    description: "제품이 필요한 바로 그 순간에 연결합니다. 라이프 모먼트 기반 크리에이터 매칭 플랫폼 — 가입비 무료, 수수료 0%.",
    siteName: "CreadyPick",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreadyPick | 제품이 필요한 바로 그 순간에 연결합니다",
    description: "크리에이터의 라이프 모먼트에 맞춰 브랜드를 연결하는 타이밍 매칭 플랫폼. 가입비 무료, 수수료 0%.",
    creator: "@creadypick",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { Toaster } from "@/components/ui/sonner";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <UnifiedProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <SiteFooter />
            <Toaster />
          </ThemeProvider>
        </UnifiedProvider>
      </body>
    </html>
  );
}
