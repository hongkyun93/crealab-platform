import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, proposal, brandName, influencerName } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("API Key missing, using fallback contract.");
            return NextResponse.json({ result: getFallbackContract(brandName, influencerName, proposal) });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const historyText = messages.map((m: any) => `${m.senderName}: ${m.content}`).join("\n");

        const systemPrompt = `
당신은 대한민국 법률에 정통한 법률 전문가이자 인플루언서 마케팅 계약 전문가입니다.
브랜드와 크리에이터 사이의 대화 내용을 바탕으로 '표준 광고 협업 계약서'를 작성해주세요.

[계약 당사자]
- 갑(광고주): ${brandName}
- 을(크리에이터): ${influencerName}

[상품 정보]
- 상품명: ${proposal.product_name || proposal.productName}
- 캠페인 성격: ${proposal.product_type === 'gift' ? '제품 협찬' : '제품 대여'}

[대화 요약 및 주요 합의 내용 파악]
다음은 두 당사자 간의 대화 내용입니다:
${historyText}

[지침]
1. 위 대화 내용에서 합의된 원고료, 콘텐츠 형태(릴스, 쇼츠 등), 업로드 일정, 필수 유지 기간, 수정 횟수 등을 정확히 반영하세요.
2. 대화에서 명시되지 않은 부분은 일반적인 인플루언서 마케팅 표준 계약 관례에 따라 '갑'과 '을' 모두에게 공정하게 작성하세요.
3. 대한민국 법률에 의거하여 전문적인 어조(예: ~한다, ~해야 한다)로 작성하세요.
4. 출력 형식은 깔끔한 Markdown 형식으로 조항별로 구분하여 작성하세요.
5. 반드시 포함할 조목: 목적, 콘텐츠 제작 및 게시, 원고료 지급, 저작권 및 초상권, 비밀유지, 계약 해지, 분쟁 해결.

최종 계약서 초안을 작성해주세요.
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("Contract Generation Failed (Using Fallback):", error);
        // Fallback Template
        const { brandName, influencerName, proposal } = await req.json().catch(() => ({}));
        return NextResponse.json({ result: getFallbackContract(brandName || "광고주", influencerName || "크리에이터", proposal || {}) });
    }
}

function getFallbackContract(brand: string, creator: string, proposal: any) {
    const productName = proposal.product_name || proposal.productName || "협업 제품";
    const cost = proposal.compensation_amount || "협의된 금액";
    const today = new Date().toLocaleDateString();

    return `
# 표준 광고 협업 계약서

**제1조 [목적]**
본 계약은 '${brand}'(이하 "갑")와 '${creator}'(이하 "을") 간의 '${productName}' 홍보 콘텐츠 제작 및 게시에 관한 제반 사항을 규정함을 목적으로 한다.

**제2조 [계약 기간]**
본 계약의 효력은 체결일로부터 콘텐츠 게시 후 6개월까지 유지된다.

**제3조 [원고료 및 지급]**
1. "갑"은 "을"에게 콘텐츠 제작의 대가로 금 **${cost}**을(를) 지급한다.
2. 지급 시기는 콘텐츠 업로드 및 검수 완료 후 30일 이내로 한다.

**제4조 [콘텐츠 제작 가이드]**
1. "을"은 "갑"이 제공하는 가이드라인을 준수하여 콘텐츠를 제작해야 한다.
2. 콘텐츠에는 공정위 지침에 따른 '광고 포함' 표시를 명확히 해야 한다.

**제5조 [업로드 및 유지]**
1. "을"은 협의된 날짜에 콘텐츠를 업로드해야 한다.
2. 업로드된 콘텐츠는 최소 6개월간 공개 상태로 유지되어야 한다.

**제6조 [저작권 및 사용권]**
콘텐츠의 저작권은 "을"에게 있으나, "갑"은 이를 홍보 목적으로 2차 활용할 수 있다. (단, 협의된 범위 내에서)

**제7조 [계약 해지]**
어느 일방이 계약 내용을 위반하는 경우, 상대방은 시정을 요구할 수 있으며 불이행 시 계약을 해지할 수 있다.

**제8조 [관할 법원]**
본 계약과 관련하여 발생한 분쟁은 "갑"의 소재지 관할 법원을 1심 법원으로 한다.

위 내용을 증명하기 위해 계약서를 작성하고 기명 날인한다.

작성일자: ${today}
    `;
}
