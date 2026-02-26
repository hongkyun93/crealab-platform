
export type WorkspaceStage = 'negotiation' | 'contract' | 'shipping' | 'content' | 'settlement' | 'final_complete';

/**
 * 모든 proposal 타입(moment_proposals, product_applications, campaign_applications)을 동일 로직으로 처리.
 * info-panel.tsx의 stage 계산과 동일 기준 → store stageMap에 공유 사용.
 */
export function computeWorkspaceStage(proposal: any): WorkspaceStage {
    if (!proposal) return 'negotiation';

    const status = proposal.status ?? '';
    const contractStatus = proposal.contract_status ?? '';
    const deliveryStatus = proposal.delivery_status ?? '';
    const contentStatus = proposal.content_submission_status ?? '';
    const paymentConfirmed = !!(proposal as any).payment_confirmed_at;
    const brandSigned = !!(proposal as any).brand_signature;
    const influencerSigned = !!(proposal as any).influencer_signature;

    // 최종 완료
    if (status === 'final_complete') return 'final_complete';

    // 정산 단계
    if (status === 'settlement') return 'settlement';

    // 콘텐츠 단계
    if (contentStatus === 'submitted' || contentStatus === 'approved') return 'content';

    // 배송 단계 — 결제 확인 or 배송 시작
    if (deliveryStatus === 'shipped' || deliveryStatus === 'delivered') return 'shipping';
    if (paymentConfirmed) return 'shipping';

    // 계약 단계 — 양측 서명 완료 or contract_status='signed'
    if (contractStatus === 'signed' || (brandSigned && influencerSigned)) return 'contract';

    // 계약 단계 — status 기반 fallback
    if (['signed', 'confirmed', 'started', 'completed'].includes(status)) return 'contract';

    // 조건 협의 단계
    if (['accepted', 'negotiating', 'offered', 'pending', 'applied', 'active', 'in_progress'].includes(status)) return 'negotiation';

    return 'negotiation';
}
