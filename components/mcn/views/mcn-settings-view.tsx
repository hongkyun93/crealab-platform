"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, Building2, FileSignature, Loader2, Save, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { InviteLinkGenerator } from "../invite-link-generator"
import { RevenueSplitEditor } from "../revenue-split-editor"
import { TeamStatistics } from "../team-statistics"
import { type CreatorSummary } from "../types/mcn"

interface McnSettingsViewProps {
    teamId: string
    summaryData: CreatorSummary[]
    splitRatios: Record<string, number>
    onSplitSaved: (creatorId: string, newRatio: number) => void
    onEditProfile: (userId: string) => void
    onRemoveMember: (userId: string, name: string) => void
}

interface PerfEntry { latest: { cpe?: number; engagement_rate?: number }; count: number }

export function McnSettingsView({
    teamId, summaryData, splitRatios, onSplitSaved, onEditProfile, onRemoveMember
}: McnSettingsViewProps) {
    const { supabase } = useAuth()
    const [splitEditorCreator, setSplitEditorCreator] = useState<{
        id: string; name: string; avatar: string | null; currentRatio: number
    } | null>(null)

    // Performance data
    const [perfData, setPerfData] = useState<Record<string, PerfEntry>>({})
    useEffect(() => {
        if (!teamId || summaryData.length === 0) return
        const ids = summaryData.map(c => c.user_id)
        supabase
            .from('campaign_performance')
            .select('creator_id, engagement_rate, cpe, cpr, created_at')
            .in('creator_id', ids)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (!data) return
                const grouped: Record<string, PerfEntry> = {}
                data.forEach((row: any) => {
                    if (!grouped[row.creator_id]) grouped[row.creator_id] = { latest: row, count: 1 }
                    else grouped[row.creator_id].count++
                })
                setPerfData(grouped)
            })
    }, [teamId, summaryData, supabase])

    // Business info
    const [bizInfo, setBizInfo] = useState({ business_registration_number: '', representative_name: '', business_address: '', stamp_url: '' })
    const [contractSettings, setContractSettings] = useState({ custom_contract_terms: '', use_custom_contract: false })
    const [isSavingBiz, setIsSavingBiz] = useState(false)
    const [isSavingContract, setIsSavingContract] = useState(false)

    useEffect(() => {
        if (!teamId) return
        supabase.from('teams')
            .select('business_registration_number, representative_name, business_address, stamp_url, custom_contract_terms, use_custom_contract')
            .eq('id', teamId).single()
            .then(({ data }) => {
                if (!data) return
                setBizInfo({
                    business_registration_number: data.business_registration_number || '',
                    representative_name: data.representative_name || '',
                    business_address: data.business_address || '',
                    stamp_url: data.stamp_url || '',
                })
                setContractSettings({
                    custom_contract_terms: data.custom_contract_terms || '',
                    use_custom_contract: data.use_custom_contract || false,
                })
            })
    }, [teamId, supabase])

    const handleSaveBizInfo = async () => {
        setIsSavingBiz(true)
        await supabase.from('teams').update({
            business_registration_number: bizInfo.business_registration_number || null,
            representative_name: bizInfo.representative_name || null,
            business_address: bizInfo.business_address || null,
            stamp_url: bizInfo.stamp_url || null,
        }).eq('id', teamId)
        setIsSavingBiz(false)
        const el = document.getElementById('biz-save-btn')
        if (el) { el.textContent = '저장됨 ✓'; setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000) }
    }

    const handleSaveContract = async () => {
        setIsSavingContract(true)
        await supabase.from('teams').update({
            custom_contract_terms: contractSettings.custom_contract_terms || null,
            use_custom_contract: contractSettings.use_custom_contract,
        }).eq('id', teamId)
        setIsSavingContract(false)
        const el = document.getElementById('contract-save-btn')
        if (el) { el.textContent = '저장됨 ✓'; setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000) }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InviteLinkGenerator />
                <TeamStatistics summaryData={summaryData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MCN 팀원 관리 */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            MCN 팀원 관리
                            <span className="text-xs font-normal text-muted-foreground ml-1">(자동 정산 적용)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summaryData.length === 0 ? (
                            <p className="text-sm text-muted-foreground">소속 크리에이터가 없습니다.</p>
                        ) : (
                            <div className="divide-y">
                                {summaryData.map(c => {
                                    const ratio = splitRatios[c.user_id] ?? 0.7
                                    return (
                                        <div key={c.user_id} className="flex items-center justify-between py-2.5">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage src={c.avatar_url || ''} />
                                                    <AvatarFallback className="text-xs">{c.display_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium leading-tight">{c.display_name}</p>
                                                    <p className="text-xs text-muted-foreground">크리에이터 {Math.round(ratio * 100)}% / MCN {Math.round((1 - ratio) * 100)}%</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onEditProfile(c.user_id)}>프로필 편집</Button>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSplitEditorCreator({ id: c.user_id, name: c.display_name || '크리에이터', avatar: c.avatar_url, currentRatio: ratio })}>배분율 설정</Button>
                                                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onRemoveMember(c.user_id, c.display_name || '크리에이터')}>팀 퇴출</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 광고 성과 */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            크리에이터 광고 성과
                            <span className="text-xs font-normal text-muted-foreground ml-1">(최근 협업 기준)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summaryData.length === 0 ? (
                            <p className="text-sm text-muted-foreground">소속 크리에이터가 없습니다.</p>
                        ) : (
                            <div className="divide-y">
                                {summaryData.map(c => {
                                    const perf = perfData[c.user_id]
                                    return (
                                        <div key={c.user_id} className="flex items-center justify-between py-2.5">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage src={c.avatar_url || ''} />
                                                    <AvatarFallback className="text-xs">{c.display_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium leading-tight">{c.display_name}</p>
                                                    <p className="text-xs text-muted-foreground">{perf ? `${perf.count}건 완료` : '성과 없음'}</p>
                                                </div>
                                            </div>
                                            {perf?.latest ? (
                                                <div className="flex gap-3 text-right">
                                                    {perf.latest.cpe != null && <div><p className="text-[10px] text-muted-foreground">CPE</p><p className="text-xs font-semibold">₩{Math.round(perf.latest.cpe).toLocaleString()}</p></div>}
                                                    {perf.latest.engagement_rate != null && <div><p className="text-[10px] text-muted-foreground">참여율</p><p className="text-xs font-semibold text-emerald-600">{perf.latest.engagement_rate}%</p></div>}
                                                </div>
                                            ) : <span className="text-xs text-muted-foreground">-</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 사업자 정보 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        사업자 정보
                        <span className="text-xs font-normal text-muted-foreground ml-1">(지급명세서에 자동 반영됩니다)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">사업자등록번호</Label>
                            <Input placeholder="000-00-00000" value={bizInfo.business_registration_number} onChange={e => setBizInfo(p => ({ ...p, business_registration_number: e.target.value }))} className="h-9 text-sm font-mono" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">대표자명</Label>
                            <Input placeholder="홍길동" value={bizInfo.representative_name} onChange={e => setBizInfo(p => ({ ...p, representative_name: e.target.value }))} className="h-9 text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">사업장 주소</Label>
                        <Input placeholder="서울특별시 강남구 ..." value={bizInfo.business_address} onChange={e => setBizInfo(p => ({ ...p, business_address: e.target.value }))} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">도장 이미지 URL <span className="text-muted-foreground/60">(선택)</span></Label>
                        <Input placeholder="https://..." value={bizInfo.stamp_url} onChange={e => setBizInfo(p => ({ ...p, stamp_url: e.target.value }))} className="h-9 text-sm" />
                        {bizInfo.stamp_url && (
                            <div className="flex items-center gap-2 mt-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={bizInfo.stamp_url} alt="도장 미리보기" className="h-10 w-10 object-contain border rounded" />
                                <span className="text-xs text-muted-foreground">미리보기</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end pt-1">
                        <Button id="biz-save-btn" size="sm" onClick={handleSaveBizInfo} disabled={isSavingBiz} className="gap-1.5">
                            {isSavingBiz ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />저장 중...</> : <><Save className="h-3.5 w-3.5" />저장하기</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 자체 전자계약서 */}
            <Card className="border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                <CardHeader className="pb-3 border-b bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileSignature className="h-4 w-4 text-emerald-600" />
                            우리 회사 전용 전자계약서 양식 연동
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="use-custom" className="text-sm font-medium cursor-pointer">기본 양식 대신 사용하기</Label>
                            <Switch id="use-custom" checked={contractSettings.use_custom_contract} onCheckedChange={c => setContractSettings(p => ({ ...p, use_custom_contract: c }))} />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">크레디픽 기본 계약서 대신, 소속 크리에이터가 브랜드와 계약할 때 적용될 MCN 자체 표준 계약서 조항을 입력하세요.</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">계약서 조항 본문 (표준안)</Label>
                        <Textarea
                            placeholder={`제1조 (목적)\n본 계약은 아티스트와 MCN 간의 수익 배분 및 계약 조건을 명시합니다...\n\n제2조 (비용 정산)\n브랜드 캠페인 수익은 제세공과금을 제하고 배분율에 따라 정산됩니다...`}
                            className="min-h-[250px] font-mono text-sm leading-relaxed"
                            value={contractSettings.custom_contract_terms}
                            onChange={e => setContractSettings(p => ({ ...p, custom_contract_terms: e.target.value }))}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button id="contract-save-btn" size="sm" onClick={handleSaveContract} disabled={isSavingContract} className="gap-1.5 w-[120px] bg-emerald-600 hover:bg-emerald-700">
                            {isSavingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            저장하기
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {splitEditorCreator && (
                <RevenueSplitEditor
                    teamId={teamId}
                    creator={splitEditorCreator}
                    onClose={() => setSplitEditorCreator(null)}
                    onSaved={(creatorId, newRatio) => { onSplitSaved(creatorId, newRatio); setSplitEditorCreator(null) }}
                />
            )}
        </div>
    )
}
