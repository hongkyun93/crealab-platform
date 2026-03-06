
export type WorkspaceStage = 'negotiation' | 'contract' | 'shipping' | 'content' | 'settlement' | 'final_complete';

/**
 * 모든 proposal 타입(moment_proposals, product_applications, campaign_applications, contest)을 동일 로직으로 처리.
 * info-panel.tsx의 stage 계산과 동일 기준 → store stageMap에 공유 사용.
 *
 * [콘테스트 특이사항]
 * type === 'contest' 이면 negotiation(조건협의) 단계를 건너뛰고 바로 contract 단계에서 시작.
 * 브랜드가 챌린저를 선발하는 순간 브랜드 서명이 포함된 계약서가 생성되므로 협의 단계가 없음.
 */
export function computeWorkspaceStage(proposal: any): WorkspaceStage {
    if (!proposal) return 'negotiation';

    const isContest = proposal.type === 'contest' || proposal.original_proposal_type === 'contest_application';

    const status = proposal.status ?? '';
    const contractStatus = proposal.contract_status ?? '';
    const deliveryStatus = proposal.delivery_status ?? '';
    const contentStatus = proposal.content_submission_status ?? '';
    const paymentConfirmed = !!(proposal as any).payment_confirmed_at;
    const brandSigned = !!(proposal as any).brand_signature;
    const influencerSigned = !!(proposal as any).creator_signature;
    const brandConditionConfirmed = !!(proposal as any).brand_condition_confirmed;
    const creatorConditionConfirmed = !!(proposal as any).creator_condition_confirmed;

    // 최종 완료
    if (status === 'final_complete') return 'final_complete';

    // 정산 단계
    if (status === 'settlement') return 'settlement';

    // 콘텐츠 단계
    if (contentStatus === 'submitted' || contentStatus === 'approved') return 'content';

    // 배송 완료(수령) 시 콘텐츠 단계로 이동
    if (deliveryStatus === 'delivered') return 'content';

    // 배송 단계 — 결제 확인 or 배송 중
    if (deliveryStatus === 'shipped') return 'shipping';
    if (paymentConfirmed) return 'shipping';

    // 계약 단계 — 양측 서명 완료 or contract_status='signed'
    if (contractStatus === 'signed' || (brandSigned && influencerSigned)) return 'contract';

    // 조건 협의 완료 시 계약 단계로 이동 (Source of Truth 기반)
    if (brandConditionConfirmed && creatorConditionConfirmed) return 'contract';

    // 계약 단계 — status 기반 fallback
    if (['signed', 'confirmed', 'started', 'completed', 'contract'].includes(status)) return 'contract';

    // [콘테스트] 조건협의 단계 없음 — selected/active 상태이면 바로 계약 단계
    if (isContest && ['selected', 'active', 'applied', 'accepted', 'in_progress'].includes(status)) return 'contract';

    // 조건 협의 단계
    if (['accepted', 'negotiating', 'offered', 'pending', 'applied', 'active', 'in_progress', 'selected'].includes(status)) return 'negotiation';

    return 'negotiation';
}
