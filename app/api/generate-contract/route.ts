import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 인증 검증: 로그인된 사용자만 사용 가능
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // req.json()은 한 번만 호출 (catch 블록에서 재호출 불가)
    let body: { messages?: any[]; proposal?: any; brandName?: string; creatorName?: string; brandProfile?: any; creatorProfile?: any } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages, proposal, brandName, creatorName, brandProfile, creatorProfile } = body;

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("API Key missing, using fallback contract.");
            return NextResponse.json({ result: getFallbackContract(brandName ?? "광고주", creatorName ?? "크리에이터", proposal ?? {}) });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash" });


        const historyText = (messages ?? []).map((m: any) => `${m.senderName}: ${m.content}`).join("\n");

        // Extract all condition fields from proposal
        const productName = proposal?.product_name || proposal?.productName || "협업 제품";
        const productType = proposal?.product_type === 'gift' ? '제품 협찬(무상 제공)' : proposal?.product_type === 'loan' ? '제품 대여' : '광고 협업';
        const priceOffer = proposal?.price_offer || proposal?.compensation_amount || "미정";
        const channelInfo = proposal?.channel_name || "미정";
        const specialTerms = proposal?.special_terms || "없음";
        const hasIncentive = proposal?.has_incentive ? "있음" : "없음";
        const incentiveDetail = proposal?.incentive_detail || "없음";
        const dateReceived = proposal?.condition_product_receipt_date || "미정";
        const dateDraft = proposal?.condition_draft_submission_date || "미정";
        const dateFinal = proposal?.condition_final_submission_date || "미정";
        const dateUpload = proposal?.condition_upload_date || "미정";
        const secondaryUsagePeriod = proposal?.condition_secondary_usage_period || "미정";

        // MCN 커스텀 계약서 여부 확인
        const creatorId = creatorProfile?.id || proposal?.creator_id || proposal?.creatorId;
        let customContractTemplate: string | null = null;

        if (creatorId) {
            const { data: memberData } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', creatorId)
                .single();

            if (memberData?.team_id) {
                const { data: teamData } = await supabase
                    .from('teams')
                    .select('custom_contract_terms, use_custom_contract')
                    .eq('id', memberData.team_id)
                    .single();

                if (teamData?.use_custom_contract && teamData.custom_contract_terms) {
                    customContractTemplate = teamData.custom_contract_terms;
                }
            }
        }

        const systemPrompt = customContractTemplate ? `
당신은 대한민국 법률에 정통한 인플루언서 마케팅 계약 전문가입니다.
해당 크리에이터 소속 MCN의 **[전용 표준 전자계약서 양식]**이 제공되었습니다. 
이 양식의 기본 조항이나 문구는 절대로 훼손하거나 마음대로 삭제하지 말고, 주어진 양식을 기반으로 빈칸이나 [조건 및 대상] 부분만 아래 합의된 정보를 바탕으로 채워넣어 완성된 마크다운을 반환하세요.
(만약 부가적인 특약사항이 있다면 가장 밑에 추가 조항으로 붙여주세요.)

[MCN 전용 표준 계약서 양식]
${customContractTemplate}
` : `
[계약 당사자]
- 갑(광고주): ${brandName}
  - 대표자명: ${brandProfile?.representative_name || '미입력'}
  - 사업자등록번호: ${brandProfile?.business_number || '미입력'}
  - 사업자 유형/업태업종: ${[brandProfile?.business_type, brandProfile?.business_category].filter(Boolean).join(' / ') || '미입력'}
  - 회사 주소: ${brandProfile?.company_address || '미입력'}
  - 회사 전화번호: ${brandProfile?.company_phone || brandProfile?.phone || '미입력'}
  - 담당자: ${brandProfile?.contact_person_name || '미입력'} (${brandProfile?.contact_person_phone || ''} / ${brandProfile?.contact_person_email || ''})
  - 세금계산서 이메일: ${brandProfile?.tax_email || '미입력'}
- 을(크리에이터): ${creatorName}
  - 실명: ${creatorProfile?.legal_name || creatorProfile?.display_name || creatorName}
  - 생년월일: ${creatorProfile?.birth_date || '미입력'}
  - 주소: ${creatorProfile?.legal_address || creatorProfile?.shipping_address || '미입력'}
  - 연락처: ${creatorProfile?.phone || '미입력'}
  - 정산 계좌: ${[creatorProfile?.bank_name, creatorProfile?.account_number, creatorProfile?.account_holder].filter(Boolean).join(' / ') || '미입력'}
  - 사업자등록여부: ${creatorProfile?.creator_business_number ? `사업자 등록됨 (번호: ${creatorProfile.creator_business_number})` : '없음(개인)'}

[상품 정보]
- 상품명: ${productName}
- 협업 형태: ${productType}

[합의된 조건]
- 원고료/보상: ${priceOffer}원
- 콘텐츠 유형: ${channelInfo}
- 인센티브 유무: ${hasIncentive}${hasIncentive === "있음" ? ` (${incentiveDetail})` : ""}
- 특약 사항: ${specialTerms}

[일정]
- 제품 수령일: ${dateReceived}
- 초안 제출일: ${dateDraft}
- 최종 제출일: ${dateFinal}
- 콘텐츠 업로드일: ${dateUpload}
- 2차 활용 기간: ${secondaryUsagePeriod}${proposal?.secondary_usage_fee ? ` (비용: ${proposal.secondary_usage_fee.toLocaleString()}원)` : ''}

[대화 내용]
${historyText || "(대화 내용 없음)"}

[지침]
1. 위 합의된 조건을 계약서에 정확히 반영하세요. 특히 원고료, 콘텐츠 유형, 일정, 특약사항을 빠뜨리지 마세요.
2. 합의되지 않은 조건(미정)은 "양쪽 합의에 따라 정한다"로 표기하세요.
3. ${customContractTemplate ? "주어진 MCN 양식을 우선적으로 따르되," : "대한민국 법률에 의거하여"} 전문적인 어조(예: ~한다, ~해야 한다)로 작성하세요.
4. 출력 형식은 깔끔한 Markdown 형식으로 조항별로 구분하여 작성하세요.
5. ${customContractTemplate ? "서명란을 포함하여 양식을 그대로 유지하세요." : "반드시 포함할 조목: 목적, 콘텐츠 제작 및 게시, 원고료 지급, 일정, 저작권 및 초상권, 2차 활용, 비밀유지, 계약 해지, 분쟁 해결."}
6. 인센티브가 있는 경우 별도 조항으로 명시하세요.
7. 특약사항이 있으면 별도 조항으로 반영하세요.
8. ${customContractTemplate ? "MCN 양식 텍스트를 최우선 존중하세요." : "계약서 마지막에 서명란(당사자명, 날짜)이 포함되도록 하세요."}

최종 계약서 초안을 작성해주세요.
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("Contract Generation Failed (Using Fallback):", error);
        return NextResponse.json({ result: getFallbackContract(brandName ?? "광고주", creatorName ?? "크리에이터", proposal ?? {}) });
    }
}

function getFallbackContract(brand: string, creator: string, proposal: any) {
    const productName = proposal.product_name || proposal.productName || "협업 제품";
    const cost = proposal.price_offer || proposal.compensation_amount || "협의된 금액";
    const channelInfo = proposal.channel_name || "협의된 형태";
    const specialTerms = proposal.special_terms || null;
    const hasIncentive = proposal.has_incentive;
    const incentiveDetail = proposal.incentive_detail || "";
    const dateReceived = proposal.condition_product_receipt_date || "협의 후 결정";
    const dateDraft = proposal.condition_draft_submission_date || "협의 후 결정";
    const dateUpload = proposal.condition_upload_date || "협의 후 결정";
    const secondaryUsage = proposal.condition_secondary_usage_period || "6개월";
    const today = new Date().toLocaleDateString();

    return `
# 표준 광고 협업 계약서

**제1조 [목적]**
본 계약은 '${brand}'(이하 "갑")와 '${creator}'(이하 "을") 간의 '${productName}' 홍보 콘텐츠 제작 및 게시에 관한 제반 사항을 규정함을 목적으로 한다.

**제2조 [계약 기간]**
본 계약의 효력은 체결일로부터 콘텐츠 게시 후 ${secondaryUsage}까지 유지된다.

**제3조 [원고료 및 지급]**
1. "갑"은 "을"에게 콘텐츠 제작의 대가로 금 **${cost}원**(부가가치세 별도)을(를) 지급한다.
2. 부가가치세는 "을"의 과세 사업자 여부에 따라 별도 적용되며, 세금계산서 또는 원천징수영수증에 의한다.
3. 지급 시기는 콘텐츠 업로드 및 검수 완료 후 30일 이내로 한다.
${hasIncentive ? `4. 추가 인센티브: ${incentiveDetail}` : ""}

**제4조 [콘텐츠 제작 가이드]**
1. 콘텐츠 유형: **${channelInfo}**
2. "을"은 "갑"이 제공하는 가이드라인을 준수하여 콘텐츠를 제작해야 한다.
3. 콘텐츠에는 공정위 지침에 따른 '광고 포함' 표시를 명확히 해야 한다.

**제5조 [일정]**
1. 제품 수령일: ${dateReceived}
2. 초안 제출일: ${dateDraft}
3. 콘텐츠 업로드일: ${dateUpload}
4. "을"은 위 일정을 준수해야 하며, 불가피한 사유 발생 시 "갑"에게 사전 통보해야 한다.

**제6조 [저작권 및 2차 활용]**
1. 콘텐츠의 저작권은 "을"에게 있으나, "갑"은 이를 홍보 목적으로 2차 활용할 수 있다.
2. 2차 활용 기간: **${secondaryUsage}**${proposal.secondary_usage_fee ? ` (2차 활용 비용: ${proposal.secondary_usage_fee.toLocaleString()}원)` : ''}

**제7조 [계약 해지]**
어느 일방이 계약 내용을 위반하는 경우, 상대방은 시정을 요구할 수 있으며 불이행 시 계약을 해지할 수 있다.
${specialTerms ? `\n**제8조 [특약 사항]**\n${specialTerms}\n` : ""}
**제${specialTerms ? 9 : 8}조 [관할 법원]**
본 계약과 관련하여 발생한 분쟁은 "갑"의 소재지 관할 법원을 1심 법원으로 한다.

위 내용을 증명하기 위해 계약서를 작성하고 기명 날인한다.

작성일자: ${today}
    `;
}
