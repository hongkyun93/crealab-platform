import { CreatorProposalDialog } from "@/components/dialogs/CreatorProposalDialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CHANNELS } from "@/components/shared/ChannelSelector"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CheckCircle2, ExternalLink, ImageIcon, Send } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const CHANNEL_STYLE: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500',
    youtube: 'bg-gradient-to-br from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-br from-black via-slate-900 to-slate-800',
    blog: 'bg-gradient-to-br from-green-500 to-green-600',
    other: 'bg-gradient-to-br from-slate-600 to-slate-700',
}

function ChannelIcon({ channelId }: { channelId: string }) {
    const baseId = channelId.split('_')[0]
    const channel = CHANNELS.find(c => c.id === baseId)
    if (!channel) return null
    const Icon = channel.Icon
    return (
        <div
            className={`h-7 w-7 rounded-full ${CHANNEL_STYLE[baseId] ?? CHANNEL_STYLE.other} flex items-center justify-center shrink-0`}
            title={channel.label}
        >
            <Icon className="h-3.5 w-3.5 text-white" />
        </div>
    )
}


interface BrandProductDetailViewProps {
    productId: string
    onBack: () => void
}

export function BrandProductDetailView({ productId, onBack }: BrandProductDetailViewProps) {
    const { products, user, addProposal } = useUnifiedProvider()
    const [isOpen, setIsOpen] = useState(false)

    const product = products.find(p => String(p.id) === productId)

    // Agency/MCN Support
    const [targetCreatorId, setTargetCreatorId] = useState<string>("")
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    useEffect(() => {
        const fetchTeamMembers = async () => {
            // Only fetch if Agency/MCN
            if (user?.role === 'agency' || user?.role === 'mcn') {
                const supabase = createClient()
                // Assuming user has teamId (we added it to type)
                // If not, we might need to fetch it or rely on a wrapper that provides it.
                // For now, let's try to find team details.
                const { data } = await supabase
                    .from('team_members')
                    .select('team_id')
                    .eq('user_id', user.id)
                    .single()

                if (data?.team_id) {
                    const { data: members } = await supabase
                        .from('team_members')
                        .select(`
                            id,
                            user_id,
                            profile:profiles!team_members_user_id_fkey (
                                display_name,
                                email
                            )
                        `)
                        .eq('team_id', data.team_id)

                    if (members) {
                        setTeamMembers(members.map((m: any) => ({
                            id: m.id,
                            user_id: m.user_id,
                            name: m.profile?.display_name || m.profile?.email || 'Unknown',
                            email: m.profile?.email
                        })))
                    }
                }
            }
        }
        fetchTeamMembers()
    }, [user])

    if (!product) {
        return (
            <div className="container py-20 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
                <h2 className="text-xl font-bold">제품을 찾을 수 없습니다.</h2>
                <Button variant="link" onClick={onBack} className="mt-4">
                    목록으로 돌아가기
                </Button>
            </div>
        )
    }



    return (
        <div className="min-h-screen bg-muted/30 -mx-6 md:-mx-8 -my-8 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 목록으로 돌아가기
                </Button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Image Container */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-background rounded-2xl border border-border/60 flex items-center justify-center text-9xl shadow-sm overflow-hidden relative">
                            {product.image.startsWith('http') ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{product.image}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="aspect-square bg-background rounded-lg border border-primary/30 flex items-center justify-center text-2xl overflow-hidden ring-2 ring-primary/20 cursor-pointer">
                                {product.image.startsWith('http') ? <img src={product.image} alt="thumb" className="w-full h-full object-cover" /> : product.image}
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-square bg-muted/50 rounded-lg border border-border/40 flex items-center justify-center text-2xl opacity-40 cursor-not-allowed">
                                    {product.image.startsWith('http') ? <ImageIcon className="h-6 w-6 text-muted-foreground" /> : product.image}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.brandName || "브랜드"}</span>
                                    <Badge variant="secondary" className="px-2 py-0.5 rounded-full font-medium">{product.category}</Badge>
                                </div>
                                {product.channels && product.channels.length > 0 && (
                                    <div className="flex gap-1.5">
                                        {product.channels.map((ch: string) => (
                                            <ChannelIcon key={ch} channelId={ch} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 leading-tight text-foreground">{product.name}</h1>
                            <div className="flex items-baseline gap-2 mb-4">
                                <p className="text-3xl font-black text-foreground">
                                    {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                </p>
                                <span className="text-sm font-medium text-muted-foreground">소비자가</span>
                            </div>

                            {product.description && (
                                <div className="text-sm text-muted-foreground leading-relaxed mb-6 bg-muted/30 rounded-xl p-4 border border-border/50">
                                    {product.description}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                {user?.role !== 'brand' && (
                                    <Button size="lg" className="flex-1 text-lg h-14 shadow-lg shadow-primary/20 font-bold" onClick={() => setIsOpen(true)}>
                                        <Send className="mr-2 h-5 w-5" /> 협업 제안하기
                                    </Button>
                                )}

                                <CreatorProposalDialog
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                    target={product ? {
                                        brandName: product.brandName || "브랜드",
                                        targetName: product.name,
                                        productId: String(product.id),
                                        brandId: product.brandId,
                                        productName: product.name,
                                        sellingPoints: product.points,
                                        category: product.category,
                                        requiredShots: product.shots,
                                    } : null}
                                    teamMembers={teamMembers}
                                    prefillHandle={user?.handle || ""}
                                    onSubmit={async (data) => {
                                        if (!product || !user) return;
                                        await addProposal({
                                            toId: product.brandId,
                                            creator_id: user.id,
                                            productId: String(product.id),
                                            product_name: product.name,
                                            message: data.appealMessage || data.motivation,
                                            status: 'applied',
                                            instagramHandle: data.channelUrl,
                                            channel_name: data.channelName,
                                            channel_subtype: data.channelSubtype,
                                            channel_url: data.channelUrl,
                                            product_type: 'ad',
                                            price_offer: data.desiredCost ? parseInt(data.desiredCost) : 0,
                                            motivation: data.motivation,
                                            content_plan: data.contentPlan,
                                            portfolioLinks: data.portfolioLinks ? data.portfolioLinks.split("\n").map(l => l.trim()).filter(Boolean) : [],
                                            insightScreenshot: undefined,
                                        });
                                        // onSuccess logic
                                        setIsOpen(false);
                                        onBack();
                                    }}
                                />

                                {product.link && (
                                    <Button variant="outline" size="lg" className="flex-1 h-14 border-2 font-bold" asChild>
                                        <Link href={product.link} target="_blank">
                                            브랜드 몰 가기 <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-border/60" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 주요 소구 포인트
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.points || "브랜드에서 등록한 소구 포인트가 없습니다."}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 촬영 컷
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.shots || "브랜드에서 등록한 필수 촬영 가이드가 없습니다."}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 포함 내용
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.contentGuide || "브랜드에서 등록한 필수 포함 내용이 없습니다."}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 형식
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.formatGuide || "브랜드에서 등록한 필수 형식이 없습니다."}
                                </div>
                            </div>
                        </div>

                        {/* Brand Info & Guidelines Card */}
                        {(product.accountTag || product.tags) && (
                            <div className="mt-8 rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <div className="h-6 w-6 text-primary flex items-center justify-center font-bold">@</div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg">{product.accountTag || "@brand_official"}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            콘텐츠 업로드 시 계정 태그 필수로 부탁드립니다.
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(product.tags) ? product.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted text-foreground hover:bg-muted/80">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </Badge>
                                        )) : (product.tags || "").split(' ').map((tag: string, i: number) => tag && (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted text-foreground hover:bg-muted/80">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs text-destructive flex gap-2 items-start">
                                        <span className="font-bold shrink-0">*[필수]</span>
                                        <span>[광고] 또는 [협찬] 문구를 콘텐츠 상단(첫줄)에 반드시 기재해주세요. 공정위 문구 누락 시 수정 요청이 있을 수 있습니다.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
