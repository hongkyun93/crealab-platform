export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-12 px-6 md:px-8">
            <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
            <p className="text-sm text-muted-foreground mb-8">시행일: 2025년 5월 25일 | 최종 수정일: 2026년 2월 23일</p>

            <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

                <p>
                    주식회사 인비저블 컴퍼니(대표이사 김수민, 이하 &quot;회사&quot;)는 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
                </p>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">1. 수집하는 개인정보의 항목 및 수집 방법</h2>
                    <p className="mb-2"><strong>가. 수집 항목</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>필수:</strong> 이메일 주소, 이름(활동명), 비밀번호(암호화 저장), 역할 정보(브랜드/크리에이터/MCN)</li>
                        <li><strong>소셜 로그인 시(Google):</strong> 이메일, 이름, 프로필 이미지(제공된 경우)</li>
                        <li><strong>소셜 로그인 시(Kakao):</strong> 이메일, 이름, 프로필 이미지, 전화번호(선택 동의 시)</li>
                        <li><strong>서비스 이용 시 자동 수집:</strong> IP 주소, 접속 일시, 서비스 이용 기록, 기기 정보</li>
                        <li><strong>브랜드 회원 추가:</strong> 사업자등록번호, 대표자명, 사업장 주소, 연락처, 세금계산서 이메일</li>
                        <li><strong>크리에이터 회원 추가:</strong> 실명, 생년월일, 주소, 연락처, 정산 계좌정보, SNS 채널 정보</li>
                        <li><strong>Instagram 인사이트 데이터(선택):</strong> 게시물 조회수, 좋아요 수, 댓글 수, 공유수, 저장수, 도달수, 참여율 등 캠페인 성과 측정을 위한 SNS 활동 데이터</li>
                        <li><strong>정산·결제 처리 시:</strong> 은행명, 계좌번호, 예금주명</li>
                    </ul>
                    <p className="mt-3"><strong>나. 수집 방법:</strong> 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력, 소셜 로그인 연동, 협업 진행 중 자동 수집</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">2. 개인정보의 처리 목적</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>회원 가입 의사 확인, 본인 인증, 회원 관리</li>
                        <li>브랜드-크리에이터 매칭 서비스 제공</li>
                        <li>협업 계약서 생성 및 전자서명 처리</li>
                        <li>정산 및 수수료 처리</li>
                        <li>공지사항 전달, 고충 처리</li>
                        <li>서비스 개선 및 오류 분석</li>
                        <li>캠페인 성과 측정 및 분석 (인플루언서 마케팅 효과 분석)</li>
                        <li>법령상 의무 이행</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">3. 개인정보의 처리 및 보유 기간</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 즉시 파기, 단 관계 법령에 따라 보존 필요 시 해당 기간)</li>
                        <li><strong>계약 및 청약철회 기록:</strong> 5년 (전자상거래법)</li>
                        <li><strong>대금 결제 및 재화 공급 기록:</strong> 5년 (전자상거래법)</li>
                        <li><strong>소비자 불만 처리 기록:</strong> 3년 (전자상거래법)</li>
                        <li><strong>접속 로그:</strong> 3개월 (통신비밀보호법)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">4. 개인정보의 제3자 제공</h2>
                    <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우는 예외로 합니다.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                        <li>협업 계약 체결 시, 계약 상대방(브랜드 또는 크리에이터)에게 계약 이행에 필요한 최소한의 정보(이름, 연락처, 계좌정보)를 제공하는 경우</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">5. 개인정보처리의 위탁</h2>
                    <p className="mb-3">회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-border">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border border-border px-3 py-2 text-left">수탁업체</th>
                                    <th className="border border-border px-3 py-2 text-left">위탁 업무</th>
                                    <th className="border border-border px-3 py-2 text-left">보유·이용기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-border px-3 py-2">Supabase Inc.</td>
                                    <td className="border border-border px-3 py-2">데이터베이스 관리, 회원 인증 서비스</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Vercel Inc.</td>
                                    <td className="border border-border px-3 py-2">서비스 호스팅 및 배포</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Google LLC</td>
                                    <td className="border border-border px-3 py-2">소셜 로그인 인증, AI 분석(Gemini)</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">카카오 주식회사</td>
                                    <td className="border border-border px-3 py-2">카카오 소셜 로그인 인증</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Meta Platforms, Inc.</td>
                                    <td className="border border-border px-3 py-2">Instagram 인사이트 데이터 연동 (캠페인 성과 측정)</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">6. 정보주체의 권리·의무 및 행사 방법</h2>
                    <p>이용자는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>개인정보 열람 요구</li>
                        <li>오류 등이 있을 경우 정정 요구</li>
                        <li>삭제 요구</li>
                        <li>처리정지 요구</li>
                    </ul>
                    <p className="mt-2">위 권리 행사는 아래 개인정보 보호책임자에게 서면, 전화, 전자우편을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">7. 개인정보의 파기</h2>
                    <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>전자적 파일:</strong> 기록을 재생할 수 없는 기술적 방법으로 삭제</li>
                        <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">8. 개인정보의 안전성 확보조치</h2>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>비밀번호 암호화 저장 (bcrypt)</li>
                        <li>HTTPS(SSL/TLS) 통신 암호화</li>
                        <li>접근 권한 최소화 및 이용자별 Row Level Security 적용</li>
                        <li>내부 관리 계획 수립 및 시행</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">9. 개인정보 보호책임자</h2>
                    <div className="bg-muted p-4 rounded-lg">
                        <ul className="space-y-1">
                            <li><strong>성명:</strong> 김수민</li>
                            <li><strong>직책:</strong> 개인정보보호책임자</li>
                            <li><strong>전화:</strong> 0507-1329-2537</li>
                            <li><strong>이메일:</strong> support@creadypick.com</li>
                        </ul>
                        <p className="text-xs mt-3 text-muted-foreground">
                            개인정보 침해에 대한 신고나 상담은 다음 기관에 문의하실 수 있습니다.<br />
                            개인정보 침해신고센터: privacy.kisa.or.kr (118) | 개인정보 분쟁조정위원회: www.kopico.go.kr (1833-6972)
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">10. 쿠키(Cookie)의 운용 및 거부</h2>
                    <p className="mb-2">회사는 서비스 최적화 및 이용자 편의를 위해 쿠키를 사용합니다.</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>쿠키란:</strong> 웹사이트 운영에 이용되는 서버가 이용자 브라우저에 보내는 소량의 정보로서 이용자 PC 내 하드디스크에 저장됩니다.</li>
                        <li><strong>사용 목적:</strong> 로그인 상태 유지, 서비스 이용 통계 분석(Google Analytics), 맞춤형 서비스 제공</li>
                        <li><strong>수집 항목:</strong> 세션 식별자, 방문 페이지, 체류 시간, 접속 기기 정보</li>
                        <li><strong>보유 기간:</strong> 세션 쿠키(브라우저 종료 시 소멸), 영구 쿠키(최대 1년)</li>
                    </ul>
                    <p className="mt-2"><strong>쿠키 거부 방법:</strong> 웹브라우저 설정을 통해 모든 쿠키를 허용/거부하거나 쿠키 저장 시 확인을 요청할 수 있습니다. 단, 쿠키 저장을 거부할 경우 일부 서비스 이용이 어려울 수 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                        <li>Chrome: 설정 → 개인정보 보호 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                        <li>Safari: 환경설정 → 개인 정보 보호 → 쿠키 및 웹사이트 데이터</li>
                        <li>Edge: 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">11. 개인정보의 국외 이전</h2>
                    <p className="mb-3">회사는 서비스 제공을 위해 아래와 같이 개인정보를 국외로 이전합니다. 이는 「개인정보 보호법」 제28조의8에 따른 고지입니다.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-border">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border border-border px-3 py-2 text-left">이전받는 자</th>
                                    <th className="border border-border px-3 py-2 text-left">국가</th>
                                    <th className="border border-border px-3 py-2 text-left">이전 목적</th>
                                    <th className="border border-border px-3 py-2 text-left">이전 항목</th>
                                    <th className="border border-border px-3 py-2 text-left">보유기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-border px-3 py-2">Supabase Inc.</td>
                                    <td className="border border-border px-3 py-2">미국</td>
                                    <td className="border border-border px-3 py-2">DB 저장·인증</td>
                                    <td className="border border-border px-3 py-2">전체 수집 항목</td>
                                    <td className="border border-border px-3 py-2">회원 탈퇴 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Vercel Inc.</td>
                                    <td className="border border-border px-3 py-2">미국</td>
                                    <td className="border border-border px-3 py-2">서비스 호스팅</td>
                                    <td className="border border-border px-3 py-2">접속 로그, IP</td>
                                    <td className="border border-border px-3 py-2">3개월</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Google LLC</td>
                                    <td className="border border-border px-3 py-2">미국</td>
                                    <td className="border border-border px-3 py-2">소셜 로그인 / AI 분석 / 방문 통계</td>
                                    <td className="border border-border px-3 py-2">이메일, 이름, 방문 로그</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                                <tr>
                                    <td className="border border-border px-3 py-2">Meta Platforms, Inc.</td>
                                    <td className="border border-border px-3 py-2">미국</td>
                                    <td className="border border-border px-3 py-2">Instagram 인사이트 연동</td>
                                    <td className="border border-border px-3 py-2">SNS 활동 데이터</td>
                                    <td className="border border-border px-3 py-2">위탁 계약 종료 시까지</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-sm">이전에 동의하지 않을 권리가 있으나, 동의 거부 시 서비스 이용이 제한될 수 있습니다. 문의: support@creadypick.com</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">12. Instagram 데이터 연동 해제 및 삭제 안내</h2>
                    <p className="mb-2"><strong>[데이터 삭제 방법]</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>이용자는 언제든지 CreadyPick 서비스 내 &quot;설정 &gt; 소셜 연동&quot; 메뉴에서 Instagram 계정 연동을 해제하고 저장된 데이터를 삭제할 수 있습니다.</li>
                        <li>또한, Instagram 앱 내 [설정 및 활동] &gt; [앱 및 웹사이트] 메뉴에서도 CreadyPick의 접근 권한을 직접 취소하여 데이터 제공을 중단할 수 있습니다.</li>
                        <li>권한 취소 시 당사 서버에 저장된 해당 SNS 통계 데이터는 지체 없이 자동 파기됩니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">13. 개인정보처리방침의 변경</h2>
                    <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여 고지합니다.</p>
                </section>

                <div className="border-t pt-4 text-xs text-muted-foreground">
                    <p><strong>회사명:</strong> 주식회사 인비저블 컴퍼니</p>
                    <p><strong>대표이사:</strong> 김수민</p>
                    <p><strong>사업자등록번호:</strong> 457-88-02482</p>
                    <p><strong>통신판매업신고번호:</strong> 제2025-서울마포-1566호</p>
                    <p><strong>주소:</strong> 03911 서울 마포구 매봉산로 18 마포창업복지관 502호</p>
                    <p><strong>전화:</strong> 0507-1329-2537</p>
                </div>
            </div>
        </div>
    )
}
