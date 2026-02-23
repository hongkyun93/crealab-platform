export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12 px-6 md:px-8">
            <h1 className="text-3xl font-bold mb-2">서비스 이용약관</h1>
            <p className="text-sm text-muted-foreground mb-8">시행일: 2025년 5월 25일 | 최종 수정일: 2026년 2월 23일</p>

            <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제1조 (목적)</h2>
                    <p>본 약관은 주식회사 인비저블 컴퍼니(대표이사 김수민, 이하 &quot;회사&quot;)가 운영하는 온라인 플랫폼 CreadyPick(이하 &quot;서비스&quot;)을 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제2조 (정의)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>&quot;서비스&quot;란 회사가 제공하는 브랜드-크리에이터 매칭 및 협업 관리 플랫폼을 의미합니다.</li>
                        <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                        <li>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.</li>
                        <li>&quot;브랜드 회원&quot;이란 제품 홍보를 위해 크리에이터와 협업하고자 가입한 사업자 회원을 말합니다.</li>
                        <li>&quot;크리에이터 회원&quot;이란 콘텐츠 제작 능력을 보유하고 브랜드와 협업하고자 가입한 회원을 말합니다.</li>
                        <li>&quot;MCN 회원&quot;이란 복수의 크리에이터를 관리하는 에이전시 성격의 회원을 말합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제3조 (약관의 효력 및 변경)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
                        <li>회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
                        <li>약관 변경 시 적용일자 및 변경 사유를 명시하여 시행일 7일 이전부터 서비스 내 공지합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제4조 (서비스의 제공 및 변경)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>회사는 브랜드-크리에이터 매칭, 협업 제안 및 계약 관리, 정산 지원, AI 기반 계약서 생성 등의 서비스를 제공합니다.</li>
                        <li>회사는 서비스 내용을 변경할 경우 변경 내용을 사전에 공지합니다.</li>
                        <li>회사는 연중무휴 24시간 서비스를 제공함을 원칙으로 하되, 시스템 점검·장애 시 일시 중단될 수 있습니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제5조 (회원가입 및 탈퇴)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>이용자는 회사가 정한 양식에 따라 정보를 기입하고 본 약관에 동의함으로써 회원가입을 신청합니다.</li>
                        <li>회원은 언제든지 서비스 내 설정 메뉴 또는 고객센터를 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</li>
                        <li>탈퇴 시 개인정보는 개인정보처리방침에 따라 처리되며, 진행 중인 협업 계약이 있는 경우 해당 계약 완료 후 탈퇴가 가능합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제6조 (회원의 의무)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>회원은 타인의 정보를 도용하거나 허위 정보를 등록하여서는 안 됩니다.</li>
                        <li>회원은 서비스를 통해 체결된 계약을 성실히 이행해야 합니다.</li>
                        <li>회원은 서비스를 통해 알게 된 상대방의 개인정보를 동의 없이 제3자에게 제공하거나 영업 목적으로 활용할 수 없습니다.</li>
                        <li>회원은 서비스의 운영을 방해하는 행위(해킹, 크롤링, 과도한 API 요청 등)를 하여서는 안 됩니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제7조 (이용요금 및 정산)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>기본 회원 가입은 무료이며, 유료 기능에 대한 요금 정책은 서비스 내 별도 안내에 따릅니다.</li>
                        <li>브랜드 회원의 예치금(디파짓)은 협업 계약 서명 완료 시 자동 차감됩니다.</li>
                        <li>크리에이터에 대한 정산은 콘텐츠 업로드 및 검수 완료 후 30일 이내에 지급함을 원칙으로 합니다.</li>
                        <li>부가가치세(VAT)는 크리에이터의 과세 사업자 여부에 따라 별도 적용됩니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제8조 (저작권)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>크리에이터가 제작한 콘텐츠의 저작권은 크리에이터에게 귀속됩니다.</li>
                        <li>브랜드는 협업 계약에 명시된 범위 내에서만 해당 콘텐츠를 활용할 수 있습니다.</li>
                        <li>서비스 내 회사가 제작한 UI, 로고, 텍스트 등의 저작권은 회사에 귀속됩니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제9조 (회사의 면책)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>회사는 브랜드와 크리에이터 간의 협업 계약 당사자가 아니며, 계약 이행에 대한 책임은 당사자에게 있습니다.</li>
                        <li>회사는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                        <li>회원이 게시한 정보의 정확성 및 신뢰성에 대한 책임은 해당 회원에게 있습니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">제10조 (분쟁해결)</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>서비스 이용으로 발생한 분쟁에 대해 회사는 이용자의 의견을 최대한 반영하여 신속히 처리합니다.</li>
                        <li>본 약관에 관한 분쟁의 준거법은 대한민국 법률로 합니다.</li>
                        <li>본 약관에 관련된 소송은 회사의 본사 소재지를 관할하는 법원(서울중앙지방법원)을 제1심 법원으로 합니다.</li>
                    </ul>
                </section>

                <div className="border-t pt-4 text-xs text-muted-foreground">
                    <p><strong>회사명:</strong> 주식회사 인비저블 컴퍼니</p>
                    <p><strong>대표이사:</strong> 김수민</p>
                    <p><strong>사업자등록번호:</strong> 457-88-02482</p>
                    <p><strong>통신판매업신고번호:</strong> 제2025-서울마포-1566호</p>
                    <p><strong>주소:</strong> 03911 서울 마포구 매봉산로 18 마포창업복지관 502호</p>
                    <p><strong>전화:</strong> 0507-1329-2537</p>
                    <p><strong>고객센터:</strong> ivsb0525@gmail.com</p>
                </div>
            </div>
        </div>
    )
}
