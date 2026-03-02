import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const proposalStr = formData.get("proposal") as string | null;
    const brandName = formData.get("brandName") as string || "브랜드(갑)";
    const creatorName = formData.get("creatorName") as string || "크리에이터(을)";
    let brandProfile: any = {};
    let creatorProfile: any = {};
    try { brandProfile = JSON.parse(formData.get("brandProfile") as string || '{}'); } catch { /* ignore */ }
    try { creatorProfile = JSON.parse(formData.get("creatorProfile") as string || '{}'); } catch { /* ignore */ }


    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 지원 파일 타입 검증
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf") || file.type === "application/pdf";
    const isDocx = fileName.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDoc = fileName.endsWith(".doc") || file.type === "application/msword";

    if (!isPdf && !isDocx && !isDoc) {
        return NextResponse.json({
            error: "HWP(한글) 파일은 지원되지 않습니다. Supabase 파일을 PDF 또는 DOCX로 변환 후 업로드해주세요."
        }, { status: 415 });
    }

    // 파일 → ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    try {
        if (isPdf) {
            // PDF 파싱 (pdf-parse는 CJS 모듈, default 없이 직접 호출)
            const pdfParseModule = await import("pdf-parse");
            const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
        } else if (isDocx || isDoc) {
            // DOCX/DOC 파싱
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        }
    } catch (err) {
        console.error("[parse-contract] File parsing error:", err);
        return NextResponse.json({ error: "파일 파싱에 실패했습니다. 파일이 손상되었거나 지원되지 않는 형식입니다." }, { status: 500 });
    }

    if (!extractedText.trim()) {
        return NextResponse.json({ error: "파일에서 텍스트를 추출할 수 없습니다. 스캔된 이미지 PDF는 지원되지 않습니다." }, { status: 422 });
    }

    // 제안 조건 파싱
    let proposal: any = {};
    try {
        if (proposalStr) proposal = JSON.parse(proposalStr);
    } catch { /* ignore */ }

    const productName = proposal.product_name || proposal.productName || "협업 제품";
    const priceOffer = proposal.price_offer || "협의된 금액";
    const channelInfo = proposal.channel_name || "미정";
    const dateReceived = proposal.condition_product_receipt_date || "미정";
    const dateDraft = proposal.condition_draft_submission_date || "미정";
    const dateFinal = proposal.condition_final_submission_date || "미정";
    const dateUpload = proposal.condition_upload_date || "미정";
    const specialTerms = proposal.special_terms || "없음";
    const secondaryUsagePeriod = proposal.condition_secondary_usage_period || "미정";

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        // API 키 없으면 텍스트 추출 결과로 기본 변환
        if (!extractedText.trim()) {
            return NextResponse.json({ error: "파일에서 텍스트를 추출할 수 없습니다. PDF가 스캔 이미지인 경우 GEMINI_API_KEY가 필요합니다." }, { status: 422 });
        }
        const fallback = buildFallbackFromExtracted(extractedText, brandName, creatorName, proposal);
        return NextResponse.json({ result: fallback });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash" });

    // ── 스캔 PDF 감지: 텍스트 추출 실패 시 Gemini Vision으로 직접 전달 ──────
    if (!extractedText.trim() && isPdf) {
        const base64Data = buffer.toString("base64");
        const visionPrompt = buildVisionPrompt(brandName, creatorName, brandProfile, creatorProfile, proposal);
        try {
            const visionResult = await model.generateContent([
                { inlineData: { data: base64Data, mimeType: "application/pdf" } },
                visionPrompt
            ]);
            const text = visionResult.response.text();
            return NextResponse.json({ result: text });
        } catch (err) {
            console.error("[parse-contract] Gemini Vision error:", err);
            return NextResponse.json({ error: "스캔 PDF 분석에 실패했습니다. 파일 크기를 줄이거나 텍스트 PDF로 변환 후 다시 시도해주세요." }, { status: 500 });
        }
    }

    // ── 텍스트 추출 성공 → 기존 텍스트 기반 처리 ──────────────────────────
    if (!extractedText.trim()) {
        return NextResponse.json({ error: "파일에서 텍스트를 추출할 수 없습니다." }, { status: 422 });
    }

    const systemPrompt = buildTextPrompt(brandName, creatorName, brandProfile, creatorProfile, proposal, extractedText);

    try {
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();
        return NextResponse.json({ result: text });
    } catch (err) {
        console.error("[parse-contract] Gemini API error:", err);
        const fallback = buildFallbackFromExtracted(extractedText, brandName, creatorName, proposal);
        return NextResponse.json({ result: fallback });
    }
}

// ─── 공통 프롬프트 빌더 ────────────────────────────────────────────────────────

function buildConditions(proposal: any) {
    const productName = proposal.product_name || proposal.productName || "협업 제품";
    const priceOffer = proposal.price_offer || "협의된 금액";
    const channelInfo = proposal.channel_name || "미정";
    const dateReceived = proposal.condition_product_receipt_date || "미정";
    const dateDraft = proposal.condition_draft_submission_date || "미정";
    const dateFinal = proposal.condition_final_submission_date || "미정";
    const dateUpload = proposal.condition_upload_date || "미정";
    const specialTerms = proposal.special_terms || "없음";
    const secondaryUsagePeriod = proposal.condition_secondary_usage_period || "미정";
    const secondaryFee = proposal.secondary_usage_fee ? ` / 2차 활용 비용: ${proposal.secondary_usage_fee.toLocaleString()}원` : "";
    return { productName, priceOffer, channelInfo, dateReceived, dateDraft, dateFinal, dateUpload, specialTerms, secondaryUsagePeriod, secondaryFee };
}

function buildParties(brandName: string, creatorName: string, brandProfile: any, creatorProfile: any) {
    return `[계약 당사자]
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
  - 사업자등록여부: ${creatorProfile?.creator_business_number ? `사업자 등록됨 (번호: ${creatorProfile.creator_business_number})` : '없음(개인)'}`;
}

// 텍스트 기반 프롬프트
function buildTextPrompt(brandName: string, creatorName: string, brandProfile: any, creatorProfile: any, proposal: any, extractedText: string): string {
    const c = buildConditions(proposal);
    return `당신은 대한민국 법률 전문가이자 인플루언서 마케팅 계약 전문가입니다.

아래에 브랜드가 기존에 보유한 계약서 원문이 있습니다.
이 계약서의 **모든 조항을 빠짐없이** 추출하고,
현재 협업의 실제 조건값으로 채워 넣어 주세요.

${buildParties(brandName, creatorName, brandProfile, creatorProfile)}

[이번 협업 조건 — 계약서에 반드시 반영]
- 상품명: ${c.productName}
- 원고료/보상: ${c.priceOffer}원
- 채널/콘텐츠 유형: ${c.channelInfo}
- 제품 수령일: ${c.dateReceived}
- 초안 제출일: ${c.dateDraft}
- 최종 제출일: ${c.dateFinal}
- 콘텐츠 업로드일: ${c.dateUpload}
- 2차 활용 기간: ${c.secondaryUsagePeriod}${c.secondaryFee}
- 특약 사항: ${c.specialTerms}

[원본 계약서 전문]
${extractedText}

[지침]
1. 원본 계약서의 **모든 조항**을 유지하세요.
2. 위 [이번 협업 조건]의 값을 원본의 해당 위치에 정확히 대입하세요.
3. 당사자명(갑/을), 상품명, 금액, 날짜를 모두 실제 값으로 교체하세요.
4. 출력은 항상 **플랫폼 표준 Markdown 형식**으로 작성하세요.
5. 계약서 본문 외 다른 설명이나 메모는 넣지 마세요.

최종 계약서를 작성해주세요.`;
}

// 스캔 PDF용 Vision 프롬프트 (텍스트 없이 이미지 직접 전달)
function buildVisionPrompt(brandName: string, creatorName: string, brandProfile: any, creatorProfile: any, proposal: any): string {
    const c = buildConditions(proposal);
    return `당신은 대한민국 법률 전문가이자 인플루언서 마케팅 계약 전문가입니다.

첨부된 PDF는 브랜드가 보유한 기존 계약서입니다 (스캔 이미지 포함).
PDF에서 **모든 조항을 빠짐없이** 읽어내고,
현재 협업의 실제 조건값으로 채워 완성된 계약서를 작성해주세요.

${buildParties(brandName, creatorName, brandProfile, creatorProfile)}

[이번 협업 조건 — 계약서에 반드시 반영]
- 상품명: ${c.productName}
- 원고료/보상: ${c.priceOffer}원
- 채널/콘텐츠 유형: ${c.channelInfo}
- 제품 수령일: ${c.dateReceived}
- 초안 제출일: ${c.dateDraft}
- 최종 제출일: ${c.dateFinal}
- 콘텐츠 업로드일: ${c.dateUpload}
- 2차 활용 기간: ${c.secondaryUsagePeriod}${c.secondaryFee}
- 특약 사항: ${c.specialTerms}

[지침]
1. PDF의 **모든 조항**을 읽어내세요 (스캔 이미지도 포함).
2. 위 협업 조건값을 해당 위치에 정확히 대입하세요.
3. 당사자명(갑/을), 상품명, 금액, 날짜를 모두 실제 값으로 교체하세요.
4. 출력은 **플랫폼 표준 Markdown 형식**으로 작성하세요.
5. 계약서 본문 외 다른 설명이나 메모는 넣지 마세요.

최종 계약서를 작성해주세요.`;
}


function buildFallbackFromExtracted(
    extractedText: string,
    brandName: string,
    creatorName: string,
    proposal: any
): string {
    const productName = proposal.product_name || proposal.productName || "협업 제품";
    const priceOffer = proposal.price_offer || "협의된 금액";
    return `# 계약서 (원본 기반)

**갑(광고주):** ${brandName}
**을(크리에이터):** ${creatorName}
**상품명:** ${productName}
**원고료:** ${priceOffer}원

---

${extractedText}
`;
}
