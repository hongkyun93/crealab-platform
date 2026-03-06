// ─── Settlement Types & Constants ─────────────────────────────────────────────

export interface Settlement {
    id: string
    creator_id: string
    creator_name: string
    creator_avatar: string | null
    brand_id: string | null
    brand_name: string | null
    proposal_type: string
    proposal_id: string
    gross_amount: number
    split_ratio: number
    creator_amount: number
    mcn_amount: number
    withholding_rate: number
    withholding_amount: number
    net_creator_amount: number
    status: 'escrow' | 'void' | 'pending' | 'processing' | 'paid' | 'cancelled'
    paid_at: string | null
    settlement_month: string | null
    statement_number?: string | null
    note: string | null
    created_at: string
    tax_invoice_status?: string | null
    tax_invoice_requested_at?: string | null
}

export interface RevenueSplit {
    creator_id: string
    split_ratio: number
}

export interface CreatorBankInfo {
    bank_name: string | null
    account_number: string | null
    account_holder: string | null
}

export const PROPOSAL_TYPE_LABELS: Record<string, string> = {
    product_application: '제품 지원',
    moment_proposal: '모먼트 제안',
    campaign_application: '캠페인 지원',
}

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    escrow: { label: '입금 예정 (진행 중)', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
    pending: { label: '지급 대기', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    processing: { label: '처리 중', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    paid: { label: '지급 완료', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
    cancelled: { label: '취소됨', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
    void: { label: '무효 처리됨', color: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400' },
}

export function getMonthOptions(): { value: string; label: string }[] {
    const months: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`
        months.push({ value, label })
    }
    return months
}

export function exportSettlementsToCSV(settlements: Settlement[], month: string) {
    const header = ['크리에이터', '협업유형', '브랜드', '총액', '배분율', '크리에이터몫', 'MCN수수료', '원천징수', '실수령액', '상태', '지급일']
    const rows = settlements.map(s => {
        const wh = s.withholding_amount || Math.round(s.creator_amount * 0.033)
        const net = s.net_creator_amount || (s.creator_amount - wh)
        return [
            s.creator_name,
            PROPOSAL_TYPE_LABELS[s.proposal_type] || s.proposal_type,
            s.brand_name || '',
            s.gross_amount,
            `${Math.round(s.split_ratio * 100)}%`,
            s.creator_amount,
            s.mcn_amount,
            wh,
            net,
            STATUS_CONFIG[s.status]?.label || s.status,
            s.paid_at ? new Date(s.paid_at).toLocaleDateString('ko-KR') : '',
        ]
    })

    const csv = [header, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `정산내역_${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
