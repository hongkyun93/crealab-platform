
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured" },
                { status: 500 }
            );
        }

        const { productName, sellingPoints, category, requiredShots } = await req.json();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use stable model

        const systemPrompt = `
당신은 베테랑 콘텐츠 기획자이자 인플루언서 매니지먼트 전문가입니다.
사용자가 입력한 제품 정보를 바탕으로 브랜드에게 어필할 수 있는 [지원 동기]와 [콘텐츠 제작 계획]을 작성해주세요.

[제품 정보]
- 제품명: ${productName}
- 카테고리: ${category}
- 소구 포인트: ${sellingPoints}
- 필수 장면: ${requiredShots}

[작성 가이드]
1. 지원 동기 (motivation):
   - "이 제품이 내 팔로워들에게 왜 필요한지", "내가 얼마나 잘 표현할 수 있는지"를 열정적이고 정중하게(해요체) 작성. (공백 포함 200자 내외)

2. 콘텐츠 제작 계획 (content_plan):
   - 릴스/숏폼 영상 기준.
   - [초반 3초] -> [본론(제품 시연)] -> [클로징] 흐름으로 구체적인 촬영 구도와 멘트를 포함하여 작성. (공백 포함 300자 내외)

[출력 형식]
반드시 아래 JSON 형식으로만 출력하세요. 마크다운 코드 블록(\`\`\`json)을 사용하지 마세요.
{
  "motivation": "작성된 지원 동기 내용...",
  "content_plan": "작성된 콘텐츠 기획안 내용..."
}
`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        console.log("AI Raw Response:", text);

        // Clean up markdown if present
        const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(jsonText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback parsing or return text if simple
            jsonResponse = {
                motivation: "AI가 지원 동기를 생성했지만 형식이 올바르지 않습니다. 다시 시도해주세요.",
                content_plan: text
            };
        }

        return NextResponse.json({ result: jsonResponse });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate content", details: error.message },
            { status: 500 }
        );
    }
}
