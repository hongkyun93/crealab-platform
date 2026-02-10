
export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12 px-6 md:px-8">
            <h1 className="text-3xl font-bold mb-8">서비스 이용약관</h1>

            <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제1조 (목적)</h2>
                    <p>
                        본 약관은 주식회사 인비저블 컴퍼니(이하 "회사")이 운영하는 온라인 플랫폼 CreadyPick(이하 "서비스")을 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제2조 (정의)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>"서비스"란 회사가 제공하는 모든 온라인 서비스를 의미합니다.</li>
                        <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                        <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제3조 (약관의 명시와 개정)</h2>
                    <p>
                        회사는 본 약관의 내용과 상호, 영업소 소재지, 대표자의 성명, 사업자등록번호, 연락처 등을 이용자가 알 수 있도록 서비스 초기 화면에 게시합니다.
                    </p>
                </section>

                {/* 추가 약관 내용 생략 (표준 약관 템플릿 사용 권장) */}

                <div className="bg-muted p-4 rounded-md mt-8">
                    <p className="text-xs text-center">
                        * 본 약관은 표준 약관 예시입니다. 실제 서비스 운영 시 법률 전문가의 검토를 거쳐 수정하여 사용하시기 바랍니다.
                    </p>
                </div>
            </div>
        </div>
    )
}
