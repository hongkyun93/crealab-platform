import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface WorkspaceCompactRowProps {
    item: any
    onClick: () => void
}

export function WorkspaceCompactRow({ item, onClick }: WorkspaceCompactRowProps) {
    // ── 타입별 값 ──────────────────────────────────────────────
    const typeConfig: Record<string, { label: string; accent: string; avatarBg: string; avatarText: string }> = {
        moment_offer: {
            label: "모먼트",
            accent: "border-l-purple-500",
            avatarBg: "bg-purple-100",
            avatarText: "text-purple-700",
        },
        brand_invite: {
            label: "직접제안",
            accent: "border-l-blue-500",
            avatarBg: "bg-blue-100",
            avatarText: "text-blue-700",
        },
        creator_apply: {
            label: "캠페인",
            accent: "border-l-orange-500",
            avatarBg: "bg-orange-100",
            avatarText: "text-orange-700",
        },
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
        accepted: { label: "진행중", className: "bg-green-100 text-green-700 border-green-200" },
        signed: { label: "계약완료", className: "bg-blue-100 text-blue-700 border-blue-200" },
        completed: { label: "완료됨", className: "bg-gray-100 text-gray-600 border-gray-200" },
        rejected: { label: "거절됨", className: "bg-red-100 text-red-700 border-red-200" },
        applied: { label: "지원함", className: "bg-amber-100 text-amber-700 border-amber-200" },
        offered: { label: "제안함", className: "bg-purple-100 text-purple-700 border-purple-200" },
        pending: { label: "대기중", className: "bg-slate-100 text-slate-600 border-slate-200" },
    }

    const tc = typeConfig[item.type] ?? {
        label: item.type ?? "기타",
        accent: "border-l-slate-400",
        avatarBg: "bg-muted",
        avatarText: "text-muted-foreground",
    }
    const sc = statusConfig[item.status] ?? { label: item.status ?? "-", className: "bg-secondary text-secondary-foreground" }
    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString("ko-KR") : "-"
    const avatarSrc = item.creatorAvatar || item.creator_avatar
    const name = item.creator_name || "크리에이터"
    const initial = name[0] ?? "C"

    return (
        <div
            className={cn(
                "group flex items-stretch gap-0 rounded-lg border bg-card hover:shadow-md cursor-pointer transition-all border-l-4",
                tc.accent
            )}
            onClick={onClick}
        >
            {/* 컬러 액센트 바는 border-l-4로 대체됨 */}
            <div className="flex items-center gap-3 flex-1 min-w-0 p-3">
                {/* Avatar */}
                <div
                    className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border border-border/50",
                        avatarSrc ? "bg-muted" : cn(tc.avatarBg, tc.avatarText)
                    )}
                >
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        initial
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Row 1: name + badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm truncate">{name}</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "text-[10px] px-1.5 py-0 h-4 border-0 shrink-0",
                                tc.avatarBg, tc.avatarText
                            )}
                        >
                            {tc.label}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 h-4 font-normal shrink-0", sc.className)}
                        >
                            {sc.label}
                        </Badge>
                    </div>

                    {/* Row 2: product name */}
                    <p className="text-sm font-medium truncate mt-0.5">
                        {item.product_name || "제품 협찬"}
                    </p>

                    {/* Row 3: date + message */}
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {dateStr} · {item.message || "메시지 없음"}
                    </p>
                </div>
            </div>

            {/* Chevron */}
            <div className="flex items-center pr-3 shrink-0">
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}
