import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container mx-auto flex max-w-[90rem] flex-col items-center gap-4 text-center">
            <Link
              href="https://twitter.com/crealab"
              className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
              target="_blank"
            >
              Creadypick의 새로운 소식 받기
            </Link>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent break-keep">
              광고는 타이밍! <br />
              라이프 모먼트기반 <br />
              브랜드-크리에이터 연결 플랫폼.Ver1.20
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 break-keep">
              브랜드와 준비된 크리에이터의 만남!<br />
              &apos;완벽한 타이밍&apos;의 진정성 있는 파트너십으로 광고효과를 극대화하세요.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-lg">
                <Link href="/brand">
                  브랜드 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-lg">
                <Link href="/creator">
                  크리에이터 시작하기
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Prop Split */}
        <section id="features" className="container mx-auto space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              왜 Creadypick 인가요?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 break-keep">
              우리는 크리에이터와 브랜드의 연결의 방식을 바꿨습니다. <br />
              준비된 크리에이터를, Pick! <br />
              브랜드의 광고를 할 준비가된 크리에이터를 찾아, 브랜드의 광고효과를 극대화하세요.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Target className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">자연스러운 핏</h3>
                  <p className="text-sm text-muted-foreground break-keep">
                    크리에이터의 현재 라이프 모먼트에 딱 맞는 캠페인으로 광고 효과를 극대화하세요.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Zap className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">빠른 매칭</h3>
                  <p className="text-sm text-muted-foreground break-keep">
                    지금 제품이 필요한 크리에이터를 즉시 찾아보세요.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Sparkles className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">효율적인 소통</h3>
                  <p className="text-sm text-muted-foreground break-keep">
                    흩어진 이메일과 디엠 대신 플랫폼에서 편안하게 소통하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
