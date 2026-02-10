
import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container py-10 md:py-12 max-w-[1920px] px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="font-bold text-xl tracking-tight">CreadyPick.</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            브랜드와 크리에이터의 완벽한 타이밍.<br />
                            라이프 모먼트 기반 매칭 플랫폼.
                        </p>
                    </div>

                    <div className="md:col-span-1 space-y-4">
                        <h4 className="text-sm font-semibold">서비스</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/services" className="hover:text-foreground">서비스 소개</Link></li>
                            <li><Link href="/brand" className="hover:text-foreground">브랜드 찾기</Link></li>
                            <li><Link href="/creator" className="hover:text-foreground">크리에이터 찾기</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1 space-y-4">
                        <h4 className="text-sm font-semibold">고객지원</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/terms" className="hover:text-foreground font-medium">이용약관</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground font-medium">개인정보처리방침</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-1 space-y-4">
                        <h4 className="text-sm font-semibold">사업자 정보</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>상호명: 주식회사 인비저블 컴퍼니</p>
                            <p>대표자: 김수민</p>
                            <p>사업자등록번호: 457-88-02482</p>
                            <p>통신판매업신고: 제2025-서울마포-1566호</p>
                            <p>주소: 03911 서울 마포구 매봉산로 18 마포창업복지관 502호</p>
                            <p>이메일: hongkyun.kim@kaist.ac.kr | 전화번호: 0507-1329-2537</p>
                            <p>개인정보보호책임자: 김홍균 (hongkyun.kim@kaist.ac.kr)</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} CreadyPick. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
