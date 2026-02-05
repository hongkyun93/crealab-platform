import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt, category } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key not configured", message: "환경 변수에 GEMINI_API_KEY가 설정되지 않았습니다." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // 키 설정 완료됨. 다시 가벼운 플래시 모델 사용
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
    당신은 인플루언서 마케팅 전문가이자 전문 카피라이터입니다.
    크리에이터가 입력한 '모먼트(이벤트)' 정보를 바탕으로, 브랜드 담당자가 매력을 느낄 만한 홍보 문구(설명)를 작성해주세요.
    
    [규칙]
    1. 이 모먼트의 카테고리는 '${category}'입니다.
    2. 말투는 정중하면서도 에너지 넘치고, 전문성이 느껴지게 작성해주세요. (해요체 사용)
    3. 이모지를 적절히 사용하여 시각적인 주목도를 높이세요.
    4. 구체적인 협업 포인트나, 브랜드가 얻을 수 있는 기대 효과를 자연스럽게 녹여내세요.
    5. 길이는 3~4문장 정도로 간결하게 작성하세요. 필요하다면 글머리 기호(-)를 사용해도 좋습니다.
    6. 반드시 한국어로 작성하세요.
    
    [크리에이터가 입력한 제목 및 내용]:
    "${prompt}"
    
    위 내용을 바탕으로 더 매력적인 설명을 작성해주세요.
    `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate content", details: error.message },
            { status: 500 }
        );
    }
}
