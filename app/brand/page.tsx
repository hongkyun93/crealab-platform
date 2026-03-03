"use client"

import { ProductDetailView } from "@/components/dashboard/product-detail-view"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { ChannelSelector } from "@/components/shared/ChannelSelector"
import { SiteHeader } from "@/components/site-header"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BrandWorkspaceLayout } from "@/components/workspace/brand/layout"
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import {
    AlertCircle, ArrowRight, AtSign, BadgeCheck, Bell, Briefcase, Calculator, Camera, CheckCircle2, ChevronRight, FileText, Info, Loader2, MessageSquare, Package, Pencil,
    Search, Send, Settings, ShoppingBag, Upload, Wallet, X
} from "lucide-react"; // Explicit import for debugging
import { MomentProposalDialog, MomentProposalFormData } from "@/components/dialogs/MomentProposalDialog"
import { ProductRegistrationDialog, ProductFormData } from "@/components/dialogs/ProductRegistrationDialog"
import { ExternalLink, Eye, MapPin, SearchX, User, Users } from "lucide-react"; // Explicit import for debugging
import dynamic from 'next/dynamic'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
// [PERF Plan B] AIPriceCalculator is only shown in a specific tab. Dynamic import removes it from initial bundle.
const AIPriceCalculator = dynamic(() => import('@/components/ai-price-calculator').then(m => m.AIPriceCalculator), {
    ssr: false,
    loading: () => <div className="w-full h-32 bg-muted/30 rounded-xl flex items-center justify-center text-sm text-muted-foreground">AI 가격 계산기 로딩 중...</div>
})
// [PERF Plan B] SignatureCanvas is only needed when the signature modal opens.
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
    ssr: false,
    loading: () => <div className="w-full h-48 bg-muted/30 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-sm text-muted-foreground">서명 영역 로딩 중...</div>
}) as any

// Brand View Components
import { BrandProfileView } from "@/components/brand/views/BrandProfileView"
import { DepositView } from "@/components/brand/views/DepositView"
import { DiscoverView } from "@/components/brand/views/DiscoverView"
import { MyCampaignsView } from "@/components/brand/views/MyCampaignsView"
import { MyProductsView } from "@/components/brand/views/MyProductsView"
import { WorkspaceView } from "@/components/brand/views/WorkspaceView"
import { ReadonlyProposalDialog } from "@/components/proposal/readonly-proposal-dialog"
import { useProducts } from "@/components/providers/product-provider"

import { DemoBanner } from "@/components/demo-banner"
import { POPULAR_TAGS } from "@/lib/constants/categories"
import { CampaignBrowseView } from "@/components/shared/CampaignBrowseView"
import { ProductBrowseView } from "@/components/shared/ProductBrowseView"

import { BrandDashboard } from "@/components/brand/brand-dashboard"
export default function BrandDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <DemoBanner />
            <BrandDashboard />
        </Suspense>
    )
}
