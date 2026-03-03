"use client"

import InsightAnalyzer from "@/components/creator/InsightAnalyzer"
import { type Campaign, type CreatorMoment } from "@/lib/types"
import { useTeam } from "@/components/providers/team-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CampaignApplicationDialog } from "@/components/dialogs/CampaignApplicationDialog"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { CreatorWorkspaceLayout } from "@/components/workspace/creator/layout"
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { AlertCircle, ArrowRight, BadgeCheck, Banknote, Bell, Briefcase, Building2, Calendar, CheckCircle2, ChevronRight, DollarSign, ExternalLink, FileText, Filter, Gift, Image as ImageIcon, LayoutGrid, List, Megaphone, Menu, MessageSquare, Package, Pencil, Plus, Rocket, Search, Send, Settings, Shield, ShoppingBag, Sparkles, Star, Table as TableIcon, X } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from "next/navigation"

// Dialog Components - Dynamically loaded for code splitting
const CreatorProposalDialog = dynamic(() => import("@/components/dialogs/CreatorProposalDialog").then(m => ({ default: m.CreatorProposalDialog })))
const GuideDialog = dynamic(() => import("@/components/dialogs/GuideDialog").then(m => ({ default: m.GuideDialog })))
const CampaignDetailDialog = dynamic(() => import("@/components/dialogs/CampaignDetailDialog").then(m => ({ default: m.CampaignDetailDialog })))
const DetailsModal = dynamic(() => import("@/components/dialogs/DetailsModal").then(m => ({ default: m.DetailsModal })))
const ProductGuideDialog = dynamic(() => import("@/components/dialogs/ProductGuideDialog").then(m => ({ default: m.ProductGuideDialog })))
const ReadonlyProposalDialog = dynamic(() => import("@/components/proposal/readonly-proposal-dialog").then(m => ({ default: m.ReadonlyProposalDialog })))
// [PERF Plan B] SignatureCanvas is only needed when the signature modal opens.
const SignatureCanvasDynamic = dynamic(() => import('react-signature-canvas'), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-muted/30 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-sm text-muted-foreground">서명 영역 로딩 중...</div>
}) as any

// View Components
import { MomentCard } from "@/components/creator/MomentCard"
import { ApplicationsView } from "@/components/creator/views/ApplicationsView"
import { DashboardView } from "@/components/creator/views/DashboardView"
import { InboundProposalsView } from "@/components/creator/views/InboundProposalsView"
import { MomentsView } from "@/components/creator/views/MomentsView"

// Imports for Design Options
import { CampaignCardA } from "@/components/creator/campaign-cards/CampaignCardA"
import { CampaignCardB } from "@/components/creator/campaign-cards/CampaignCardB"
import { CampaignCardC } from "@/components/creator/campaign-cards/CampaignCardC"
import { BrandProductDetailView } from "@/components/creator/views/BrandProductDetailView"
import { BrandProductDiscoveryView } from "@/components/creator/views/BrandProductDiscoveryView"
import { BrandProductListView } from "@/components/creator/views/BrandProductListView"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CampaignBrowseView } from "@/components/shared/CampaignBrowseView"
import { ProductBrowseView } from "@/components/shared/ProductBrowseView"

// MCN Components
import { CampaignCardD } from "@/components/creator/campaign-cards/CampaignCardD"
import { CampaignCardE } from "@/components/creator/campaign-cards/CampaignCardE"
import { SettingsView } from "@/components/creator/views/SettingsView"
import { EarningsView } from "@/components/creator/views/EarningsView"
import { InviteLinkGenerator } from "@/components/mcn/invite-link-generator"
import { TeamMembersCard } from "@/components/mcn/team-members-card"
import { TeamStatistics } from "@/components/mcn/team-statistics"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { Users as UsersIcon } from "lucide-react"

import { POPULAR_TAGS } from "@/lib/constants/categories"

import { DemoBanner } from "@/components/demo-banner"
import { Suspense } from "react"
import { PerformanceSubmitDialog } from "@/components/workspace/creator/performance-submit-dialog"
const INITIAL_CAMPAIGNS: Campaign[] = []

// Dialog components imported from @/components/dialogs/
// Removed 5 dialog functions: ApplyDialog, GuideDialog, CampaignDetailDialog, DetailsModal, ProductGuideDialog (~625 lines)

function AIPlanModal({ isOpen, onOpenChange, planContent }: { isOpen: boolean; onOpenChange: (open: boolean) => void; planContent: string }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" /> AI 기획안
                    </DialogTitle>
                    <DialogDescription>
                        AI가 제안하는 캠페인 콘텐츠 기획안입니다. 참고하여 어필 메시지를 작성해보세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    <Textarea
                        value={planContent}
                        readOnly
                        className="min-h-[250px] bg-muted border-border text-foreground"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { CreatorDashboard } from "@/components/creator/creator-dashboard"
export default function CreatorDashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <DemoBanner />
            <CreatorDashboard />
        </Suspense>
    )
}
