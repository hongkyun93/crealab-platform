
export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-12 px-6 md:px-8">
            <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

            <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">1. 개인정보의 처리 목적</h2>
                    <p>
                        주식회사 인비저블 컴퍼니(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>회원 가입 의사 확인 및 회원 관리</li>
                        <li>재화 또는 서비스 제공 (브랜드-크리에이터 매칭 서비스)</li>
                        <li>마케팅 및 광고에의 활용</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">2. 개인정보의 처리 및 보유 기간</h2>
                    <p>
                        회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법</h2>
                    <p>
                        정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
                    </p>
                </section>

                {/* 추가 개인정보처리방침 내용 생략 (표준 템플릿 사용 권장) */}

                <div className="bg-muted p-4 rounded-md mt-8">
                    <p className="text-xs text-center">
                        * 본 개인정보처리방침은 예시입니다. 실제 수집하는 개인정보 항목과 목적에 맞춰 수정하여 사용하시기 바랍니다.
                    </p>
                </div>
            </div>
        </div>
    )
}
