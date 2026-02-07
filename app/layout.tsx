import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PlatformProvider } from "@/components/providers/platform-provider";

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
    default: "CreadyPick | 브랜드와 크리에이터의 완벽한 타이밍",
    template: "%s | CreadyPick",
  },
  description: "이사, 결혼, 여행 등 라이프 모먼트를 기반으로 준비된 크리에이터와 브랜드를 연결하는 매칭 플랫폼입니다. 광고 효율을 극대화하세요.",
  keywords: ["인플루언서 마케팅", "체험단", "유튜버 협찬", "브랜드 매칭", "크리에이터 수익", "라이프스타일 마케팅"],
  authors: [{ name: "CreadyPick Team" }],
  creator: "CreadyPick",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.creadypick.com",
    title: "CreadyPick | 광고는 타이밍! 라이프 모먼트 매칭",
    description: "준비된 브랜드와 준비된 크리에이터의 만남. '완벽한 타이밍'의 진정성 있는 파트너십을 경험하세요.",
    siteName: "CreadyPick",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreadyPick | 브랜드와 크리에이터의 연결",
    description: "지금 바로 제품이 필요한 크리에이터를 찾아보세요. 라이프 모먼트 기반 매칭 플랫폼.",
    creator: "@creadypick",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlatformProvider initialSession={session}>
          {children}
        </PlatformProvider>
      </body>
    </html>
  );
}
