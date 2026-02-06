import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, proposal, brandName, influencerName } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
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
        console.error("Contract Generation Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
