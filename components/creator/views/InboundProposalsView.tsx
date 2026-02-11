import { ChevronRight, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InboundProposalsViewProps {
    inboundProposals: any[]
    setCurrentView: (view: string) => void
    setChatProposal: (proposal: any) => void
    setIsChatOpen: (open: boolean) => void
}

export function InboundProposalsView({
    inboundProposals,
    setCurrentView,
    setChatProposal,
    setIsChatOpen
}: InboundProposalsViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in-from-right-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    돌아가기
                </Button>
                <h1 className="text-2xl font-bold">받은 제안 아카이브 (Brand Offers)</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inboundProposals.length > 0 ? (
                    inboundProposals.map((proposal: any) => (
                        <Card key={proposal.id} className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{proposal.brand_name}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()} 도착</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-purple-600">제안도착</Badge>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{proposal.product_name || "제품 제안"}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        "{proposal.message || "제안 내용이 있습니다."}"
                                    </p>
                                    <p className="font-bold text-sm text-purple-700 mt-2">
                                        {proposal.compensation_amount ? `${proposal.compensation_amount} 제안` : '원고료 협의'}
                                    </p>
                                </div>
                                <Button className="w-full h-8 text-xs" variant="secondary">제안 확인하기</Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                        도착한 제안이 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
