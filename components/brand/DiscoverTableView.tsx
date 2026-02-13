import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDateToMonth } from "@/lib/utils"

interface DiscoverTableViewProps {
    filteredEvents: any[]
    favorites: any[]
    toggleFavorite: (id: string, type: string) => void
    deleteEvent: (id: string) => Promise<void>
    user: any
}

export function DiscoverTableView({
    filteredEvents,
    favorites,
    toggleFavorite,
    deleteEvent,
    user
}: DiscoverTableViewProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">찜</TableHead>
                        <TableHead>크리에이터</TableHead>
                        <TableHead>모먼트 제목</TableHead>
                        <TableHead>희망 제품</TableHead>
                        <TableHead>팔로워</TableHead>
                        <TableHead>일정</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((item) => {
                            const isFavorite = favorites.some(f => f.target_id === item.id && f.target_type === 'event')
                            return (
                                <TableRow key={item.id} className="group hover:bg-muted/50">
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item.id, 'event');
                                            }}
                                        >
                                            <Star
                                                className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : ''}`}
                                                fill={isFavorite ? 'currentColor' : 'none'}
                                            />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-primary">
                                                {item.avatar && item.avatar.startsWith('http') ? (
                                                    <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                                ) : (
                                                    item.avatar || item.influencer?.[0] || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{item.influencer}</div>
                                                <div className="text-xs text-muted-foreground">{item.handle}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/event/${item.id}`} className="hover:underline flex items-center gap-2 group-hover:text-primary transition-colors">
                                            <span className="font-medium truncate max-w-[200px]">{item.event}</span>
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className="truncate max-w-[120px] text-sm">{item.targetProduct || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-xs bg-muted">
                                            {(item.followers || 0).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            <div>{formatDateToMonth(item.eventDate)} (이벤트)</div>
                                            <div>{item.dateFlexible ? '협의가능' : formatDateToMonth(item.postingDate)} (업로드)</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user?.type === 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                onClick={() => {
                                                    if (confirm("정말로 삭제하시겠습니까?")) deleteEvent(item.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                검색된 모먼트가 없습니다.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
