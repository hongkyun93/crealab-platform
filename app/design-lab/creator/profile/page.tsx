"use client"

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    User, MapPin, Instagram, Youtube, Twitter, Globe,
    Mail, Star, TrendingUp, DollarSign, Camera, Video,
    Share2, Download, BarChart2, PieChart, Activity,
    Layout, Grid, List, CheckCircle2
} from "lucide-react"

// --- Rich Realistic Mock Data (Creator Profile & Rate Card Context) ---
const PROFILE_DATA = {
    name: "Jenny Kim",
    handle: "@jenny_vlog",
    bio: "Life & Travel Creator | Seoul 🇰🇷 | Daily Vlog & OOTD",
    location: "Seoul, Korea",
    email: "contact@jennykim.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    stats: {
        instagram: "125K",
        youtube: "450K",
        tiktok: "850K",
        engagement: "4.8%"
    },
    rates: [
        { service: "Instagram Post", price: "2,000,000", desc: "1 Photo + Caption + Tags" },
        { service: "Instagram Reel", price: "3,500,000", desc: "15-30s Short Form Video" },
        { service: "YouTube Vlog Integration", price: "5,000,000", desc: "3-5min Feature in Vlog" },
        { service: "YouTube Dedicated Video", price: "12,000,000", desc: "10min+ Full Review" }
    ],
    tags: ["Travel", "Beauty", "Lifestyle", "Fashion"],
    portfolio: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80"
    ]
}

export default function CreatorProfilePage() {
    const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelectedDesign(index)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const renderPreview = () => {
        if (!selectedDesign) return <ClassicProfileHeader />

        switch (selectedDesign) {
            case 1: return <ClassicProfileHeader />;
            case 2: return <LinktreeStyleCard />;
            case 3: return <MediaKitPDFStyle />;
            case 4: return <PortfolioGridFocus />;
            case 5: return <StatisticsDashboard />;
            case 6: return <PricingTableCard />;
            case 7: return <AboutMeStoryStyle />;
            case 8: return <DarkModeGamerProfile />;
            case 9: return <MinimalistBusinessCard />;
            case 10: return <InstagramFeedPreview />;
            case 11: return <InteractiveSkillGraph />;
            case 12: return <VideoShowreelHero />;
            case 13: return <ReviewTestimonialSlider />;
            case 14: return <BrandCollaborationLog />;
            case 15: return <ContactFormFocus />;
            case 16: return <MapBasedTravelProfile />;
            case 17: return <NewsletterSubscription />;
            case 18: return <ShopifyProductShowcase />;
            case 19: return <CrowdfundingCampaignStyle />;
            case 20: return <NFTArtistGallery />;
            default: return <ClassicProfileHeader />;
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">프로필 & Rate Card 디자인 랩</h1>
                <p className="text-muted-foreground">크리에이터를 위한 20가지 프로필 및 미디어킷 디자인을 확인해보세요.</p>
            </div>

            {/* Main Preview Area */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {selectedDesign ? `Design Option #${selectedDesign}` : "Default View"}
                        </Badge>
                    </h3>
                    {selectedDesign && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDesign(null)}>
                            Reset
                        </Button>
                    )}
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border min-h-[400px]">
                    {renderPreview()}
                </div>
            </div>

            <div className="border-t my-8" />

            {/* All Variations Grid */}
            <h3 className="font-bold text-xl mb-6">All 20 Design Variations</h3>
            <div className="grid grid-cols-1 gap-12">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h4 className="font-bold text-lg text-gray-800">Style #{i + 1}</h4>
                            <Button size="sm" variant="outline" onClick={() => handleSelect(i + 1)}>View in Main Area</Button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl overflow-hidden">
                            {(() => {
                                switch (i + 1) {
                                    case 1: return <ClassicProfileHeader />;
                                    case 2: return <LinktreeStyleCard />;
                                    case 3: return <MediaKitPDFStyle />;
                                    case 4: return <PortfolioGridFocus />;
                                    case 5: return <StatisticsDashboard />;
                                    case 6: return <PricingTableCard />;
                                    case 7: return <AboutMeStoryStyle />;
                                    case 8: return <DarkModeGamerProfile />;
                                    case 9: return <MinimalistBusinessCard />;
                                    case 10: return <InstagramFeedPreview />;
                                    case 11: return <InteractiveSkillGraph />;
                                    case 12: return <VideoShowreelHero />;
                                    case 13: return <ReviewTestimonialSlider />;
                                    case 14: return <BrandCollaborationLog />;
                                    case 15: return <ContactFormFocus />;
                                    case 16: return <MapBasedTravelProfile />;
                                    case 17: return <NewsletterSubscription />;
                                    case 18: return <ShopifyProductShowcase />;
                                    case 19: return <CrowdfundingCampaignStyle />;
                                    case 20: return <NFTArtistGallery />;
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- 20 Design Components ---

// 1. Classic Profile Header
function ClassicProfileHeader() {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="px-6 pb-6">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                        <img src={PROFILE_DATA.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit Profile</Button>
                        <Button size="sm">Share</Button>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{PROFILE_DATA.name}</h2>
                    <div className="text-gray-500 text-sm mb-2">{PROFILE_DATA.handle}</div>
                    <p className="text-sm text-gray-700 max-w-lg mb-4">{PROFILE_DATA.bio}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {PROFILE_DATA.location}</span>
                        <a href="#" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe className="w-4 h-4" /> website.com</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 2. Linktree Style Card
function LinktreeStyleCard() {
    return (
        <div className="bg-gray-100 p-8 rounded-xl flex justify-center">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-xl text-center space-y-6">
                <div className="flex flex-col items-center">
                    <img src={PROFILE_DATA.avatar} className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-gray-50" />
                    <h3 className="font-bold text-lg">{PROFILE_DATA.handle}</h3>
                    <p className="text-xs text-gray-500">{PROFILE_DATA.bio}</p>
                </div>
                <div className="space-y-3">
                    {['Latest YouTube Video', 'Instagram', 'TikTok', 'Shop My Looks', 'Contact Me'].map((link, i) => (
                        <Button key={i} variant="outline" className="w-full rounded-full h-12 hover:bg-black hover:text-white transition-colors border-2">
                            {link}
                        </Button>
                    ))}
                </div>
                <div className="flex justify-center gap-4 text-gray-400">
                    <Instagram className="w-5 h-5" />
                    <Youtube className="w-5 h-5" />
                    <Twitter className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}

// 3. Media Kit PDF Style
function MediaKitPDFStyle() {
    return (
        <div className="bg-white border rounded-none p-8 max-w-3xl mx-auto shadow-sm aspect-[1/1.414] relative text-sm">
            <div className="absolute top-0 right-0 p-4 bg-black text-white text-xs font-bold uppercase">Media Kit 2024</div>
            <div className="flex gap-8 mb-12 mt-4">
                <img src={PROFILE_DATA.avatar} className="w-32 h-32 object-cover grayscale" />
                <div>
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">{PROFILE_DATA.name}</h1>
                    <div className="h-1 w-20 bg-black mb-4"></div>
                    <p className="text-gray-600 leading-relaxed max-w-md">{PROFILE_DATA.bio} Creating authentic content for a global audience with a focus on sustainable travel and lifestyle.</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                    <div className="text-3xl font-black">{PROFILE_DATA.stats.instagram}</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">Instagram</div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                    <div className="text-3xl font-black">{PROFILE_DATA.stats.youtube}</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">YouTube</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-black">{PROFILE_DATA.stats.tiktok}</div>
                    <div className="text-xs uppercase tracking-widest text-gray-500">TikTok</div>
                </div>
            </div>

            <h3 className="font-bold text-lg uppercase mb-4 border-b-2 border-black pb-2">Audience Demographics</h3>
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <div className="flex justify-between text-xs mb-1"><span>Female</span><span>72%</span></div>
                    <div className="w-full bg-gray-200 h-2 mb-3"><div className="w-[72%] bg-black h-full"></div></div>

                    <div className="flex justify-between text-xs mb-1"><span>Male</span><span>28%</span></div>
                    <div className="w-full bg-gray-200 h-2"><div className="w-[28%] bg-gray-500 h-full"></div></div>
                </div>
                <div className="text-xs space-y-2">
                    <div className="flex justify-between font-bold"><span>Age 18-24</span><span>25%</span></div>
                    <div className="flex justify-between font-bold"><span>Age 25-34</span><span>45%</span></div>
                    <div className="flex justify-between font-bold"><span>Age 35-44</span><span>20%</span></div>
                </div>
            </div>
        </div>
    )
}

// 4. Portfolio Grid Focus
function PortfolioGridFocus() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Featured Work</h2>
                <Button variant="ghost" className="text-sm">View All</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PROFILE_DATA.portfolio.map((img, i) => (
                    <div key={i} className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold border-b-2 border-white pb-1">View Project</span>
                        </div>
                    </div>
                ))}
                <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 cursor-pointer">
                    + More
                </div>
            </div>
        </div>
    )
}

// 5. Statistics Dashboard
function StatisticsDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="text-sm text-gray-500 mb-4 font-bold flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Growth Rate</div>
                    <div className="h-[150px] flex items-end gap-2">
                        {[30, 45, 35, 60, 50, 75, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-green-100 hover:bg-green-200 rounded-t transition-colors relative group">
                                <div className="absolute bottom-0 w-full bg-green-500 rounded-t" style={{ height: `${h}%` }}></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl flex flex-col justify-center text-center">
                    <div className="text-3xl font-bold text-blue-600">4.8%</div>
                    <div className="text-xs text-blue-400 font-bold uppercase mt-1">Engagement</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl flex flex-col justify-center text-center">
                    <div className="text-3xl font-bold text-purple-600">1.2M</div>
                    <div className="text-xs text-purple-400 font-bold uppercase mt-1">Total Reach</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl flex flex-col justify-center text-center col-span-2">
                    <div className="flex justify-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />)}
                    </div>
                    <div className="text-xs text-orange-900 font-bold uppercase">5.0 Brand Rating</div>
                </div>
            </div>
        </div>
    )
}

// 6. Pricing Table Card
function PricingTableCard() {
    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Service Rates</h2>
                <p className="text-gray-500">Standard collaboration packages for 2024</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROFILE_DATA.rates.map((rate, i) => (
                    <div key={i} className="border rounded-xl p-6 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer bg-white group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                                {i % 2 === 0 ? <Camera className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </div>
                            <div className="font-mono font-bold text-lg">{rate.price} <span className="text-xs text-gray-400 font-normal">KRW</span></div>
                        </div>
                        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600">{rate.service}</h3>
                        <p className="text-sm text-gray-500 mb-4">{rate.desc}</p>
                        <ul className="text-xs space-y-2 text-gray-600 mb-6">
                            <li className="flex gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> High Resolution Assets</li>
                            <li className="flex gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Commercial Rights (1 Year)</li>
                        </ul>
                        <Button className="w-full" variant="outline">Select Plan</Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 7. About Me Story Style
function AboutMeStoryStyle() {
    return (
        <div className="flex flex-col md:flex-row gap-8 items-center bg-stone-50 p-8 rounded-2xl">
            <div className="w-full md:w-1/2 relative">
                <div className="absolute top-4 left-4 w-full h-full border-2 border-stone-300 rounded-xl"></div>
                <img src={PROFILE_DATA.cover} className="w-full aspect-[4/5] object-cover rounded-xl shadow-lg relative z-10" />
            </div>
            <div className="w-full md:w-1/2 space-y-6 font-serif">
                <div className="text-xs font-bold tracking-widest uppercase text-stone-500">My Journey</div>
                <h2 className="text-4xl italic text-stone-900 leading-tight">"Capturing moments that inspire wanderlust."</h2>
                <div className="bg-white p-6 shadow-sm border border-stone-100 rounded text-stone-600 text-sm leading-relaxed">
                    <p className="mb-4">Hello! I'm Jenny. I started my content creation journey 5 years ago with a simple camera and a passion for storytelling.</p>
                    <p>Today, I work with brands to create authentic narratives that resonate with my community of travel enthusiasts and lifestyle seekers.</p>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" className="h-12 opacity-50" />
            </div>
        </div>
    )
}

// 8. Dark Mode Gamer Profile
function DarkModeGamerProfile() {
    return (
        <div className="bg-[#0f0f12] text-white p-6 rounded-xl border border-[#333]">
            <div className="flex gap-6 items-center border-b border-[#333] pb-6 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#ff0055] to-[#0000ff] p-[2px]">
                    <div className="w-full h-full bg-[#1a1a20] rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src={PROFILE_DATA.avatar} className="w-full h-full object-cover" />
                    </div>
                </div>
                <div>
                    <div className="flex gap-2 mb-1">
                        <Badge className="bg-[#2a2a35] text-[#888] hover:bg-[#333]">LVL. 99</Badge>
                        <Badge className="bg-[#ff0055] text-white border-0">PRO CREATOR</Badge>
                    </div>
                    <h1 className="text-3xl font-black italic tracking-wider mb-2">{PROFILE_DATA.name.toUpperCase()}</h1>
                    <div className="flex gap-4 text-xs text-[#888] font-mono">
                        <span><span className="text-white font-bold">4.2M</span> FOLLOWERS</span>
                        <span><span className="text-white font-bold">128</span> CAMPAIGNS</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {['Twitch Partner', 'Esports Host', 'Tech Reviewer', 'Game Dev'].map((tag, i) => (
                    <div key={i} className="bg-[#1a1a20] border border-[#333] p-3 rounded hover:bg-[#252530] hover:border-[#ff0055] cursor-pointer transition-colors flex justify-between items-center group">
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{tag}</span>
                        <div className="w-2 h-2 rounded-full bg-[#333] group-hover:bg-[#ff0055] group-hover:shadow-[0_0_10px_#ff0055]"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 9. Minimalist Business Card
function MinimalistBusinessCard() {
    return (
        <div className="bg-white border shadow-lg max-w-md mx-auto aspect-[1.75/1] p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-gray-50 rounded-full"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-black rounded-full opacity-5"></div>

            <div className="relative z-10">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{PROFILE_DATA.name}</h2>
                <p className="text-sm text-gray-500 font-medium">{PROFILE_DATA.bio.split('|')[0]}</p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
                <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {PROFILE_DATA.email}</div>
                    <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> {PROFILE_DATA.handle}</div>
                    <div className="flex items-center gap-2"><Instagram className="w-3 h-3" /> @jenny_vlog</div>
                </div>
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg">
                    <span className="font-bold text-xs">QR</span>
                </div>
            </div>
        </div>
    )
}

// 10. Instagram Feed Preview
function InstagramFeedPreview() {
    return (
        <div className="max-w-sm mx-auto bg-white border rounded-xl overflow-hidden pb-4">
            <div className="p-4 flex gap-4 items-center border-b pb-4 mb-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                    <div className="bg-white w-full h-full rounded-full p-[2px]">
                        <img src={PROFILE_DATA.avatar} className="w-full h-full rounded-full object-cover" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="font-bold text-sm mb-1">{PROFILE_DATA.handle.replace('@', '')}</div>
                    <div className="flex justify-between text-xs text-center pr-4">
                        <div><div className="font-bold">1,204</div>Posts</div>
                        <div><div className="font-bold">125K</div>Followers</div>
                        <div><div className="font-bold">450</div>Following</div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-2">
                <p className="text-xs mb-1"><span className="font-bold">{PROFILE_DATA.name}</span></p>
                <p className="text-xs text-gray-600">{PROFILE_DATA.bio}</p>
                <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs bg-gray-100 text-black hover:bg-gray-200" variant="ghost">Following</Button>
                    <Button size="sm" className="flex-1 h-8 text-xs bg-gray-100 text-black hover:bg-gray-200" variant="ghost">Message</Button>
                </div>
            </div>
            <div className="flex border-t border-b mt-2">
                <div className="flex-1 py-2 flex justify-center border-b-2 border-black"><Grid className="w-5 h-5" /></div>
                <div className="flex-1 py-2 flex justify-center text-gray-400"><Video className="w-5 h-5" /></div>
                <div className="flex-1 py-2 flex justify-center text-gray-400"><User className="w-5 h-5" /></div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100">
                        <img src={PROFILE_DATA.portfolio[i % 3]} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// 11. Interactive Skill Graph
function InteractiveSkillGraph() {
    return (
        <div className="flex justify-center p-8 bg-gray-50 rounded-xl">
            <div className="relative w-64 h-64">
                {/* Hexagon Background */}
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 fill-gray-300 stroke-gray-400">
                    <polygon points="50 5, 95 27.5, 95 72.5, 50 95, 5 72.5, 5 27.5" />
                </svg>
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 fill-none stroke-gray-400 absolute top-0 left-0 scale-75 origin-center">
                    <polygon points="50 5, 95 27.5, 95 72.5, 50 95, 5 72.5, 5 27.5" />
                </svg>
                <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0 drop-shadow-lg">
                    <polygon points="50 15, 85 35, 80 70, 50 85, 20 70, 15 35" className="fill-blue-500/50 stroke-blue-600 stroke-2" />
                </svg>

                {/* Labels */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs font-bold text-gray-600">Creativity</div>
                <div className="absolute top-1/4 right-0 translate-x-4 text-xs font-bold text-gray-600">Reach</div>
                <div className="absolute bottom-1/4 right-0 translate-x-4 text-xs font-bold text-gray-600">Engagement</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-xs font-bold text-gray-600">Consistency</div>
                <div className="absolute bottom-1/4 left-0 -translate-x-4 text-xs font-bold text-gray-600">Video</div>
                <div className="absolute top-1/4 left-0 -translate-x-4 text-xs font-bold text-gray-600">Photo</div>
            </div>
        </div>
    )
}

// 12. Video Showreel Hero
function VideoShowreelHero() {
    return (
        <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80" className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
                <h2 className="text-2xl font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">Watch Showreel</h2>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xs font-bold bg-red-600 px-2 py-1 rounded inline-block mb-1">LIVE</div>
                <div className="text-sm font-bold">2024 Highlight Reel</div>
            </div>
        </div>
    )
}

// 13. Review Testimonial Slider
function ReviewTestimonialSlider() {
    return (
        <div className="bg-white border rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 text-6xl font-serif text-gray-100">"</div>
            <div className="relative z-10 max-w-lg mx-auto">
                <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                    "Working with Jenny was an absolute pleasure. Her content quality exceeded our expectations and drove real conversions for our summer campaign."
                </p>
                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        <img src="https://github.com/shadcn.png" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-sm">Sarah Lee</div>
                        <div className="text-xs text-gray-500">Marketing Director, Brand X</div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
        </div>
    )
}

// 14. Brand Collaboration Log
function BrandCollaborationLog() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-lg">Past Collaborations</h3>
                <span className="text-xs text-gray-500">50+ Brands Trusted</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['NIKE', 'ADIDAS', 'SAMSUNG', 'APPLE', 'SONY', 'CANON', 'ZARA', 'H&M'].map((brand, i) => (
                    <div key={i} className="aspect-[2/1] bg-gray-50 border rounded-lg flex items-center justify-center grayscale hover:grayscale-0 hover:bg-white transition-all cursor-pointer">
                        <span className="font-black text-lg text-gray-400">{brand}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 15. Contact Form Focus
function ContactFormFocus() {
    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
            <h2 className="text-xl font-bold mb-2">Let's Work Together</h2>
            <p className="text-gray-500 text-sm mb-6">Fill out the form below for business inquiries.</p>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Brand Name</label>
                    <div className="h-10 bg-gray-50 rounded border flex items-center px-3 text-sm text-gray-400">Enter your brand name</div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Budget Range</label>
                    <div className="h-10 bg-gray-50 rounded border flex items-center px-3 text-sm text-gray-400">Select budget</div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Message</label>
                    <div className="h-24 bg-gray-50 rounded border p-3 text-sm text-gray-400">Tell me about your campaign...</div>
                </div>
                <Button className="w-full font-bold">Send Inquiry</Button>
            </div>
        </div>
    )
}

// 16. Map Based Travel Profile
function MapBasedTravelProfile() {
    return (
        <div className="bg-blue-50 rounded-xl overflow-hidden relative h-[400px]">
            {/* Map BG */}
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Seoul_City_Map.png')] bg-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"></div>

            {/* Profile Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <img src={PROFILE_DATA.avatar} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-blue-600 font-bold uppercase mb-1">Current Location</div>
                    <h2 className="font-bold text-xl flex items-center gap-1"><MapPin className="w-5 h-5 text-red-500" /> Seoul, South Korea</h2>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-2xl font-black">24</div>
                    <div className="text-xs text-gray-500 uppercase">Countries Visited</div>
                </div>
            </div>

            {/* Pins */}
            <div className="absolute top-1/4 left-1/4 animate-bounce"><MapPin className="w-8 h-8 text-blue-600 drop-shadow-md fill-white" /></div>
            <div className="absolute top-1/3 right-1/3 animate-bounce animation-delay-500"><MapPin className="w-8 h-8 text-blue-600 drop-shadow-md fill-white" /></div>
        </div>
    )
}

// 17. Newsletter Subscription
function NewsletterSubscription() {
    return (
        <div className="bg-[#f8f5f2] p-8 rounded-2xl text-center border border-[#e6e2dd]">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-orange-500">
                <Mail className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2d2a26] mb-2">Join the Inner Circle</h2>
            <p className="text-[#6b665f] text-sm mb-6 max-w-sm mx-auto">Get exclusive behind-the-scenes content, creator tips, and early access to drops.</p>
            <div className="flex max-w-sm mx-auto gap-2">
                <div className="flex-1 bg-white border border-[#e6e2dd] rounded px-4 py-2 text-sm text-gray-400 text-left">your@email.com</div>
                <Button className="bg-[#2d2a26] text-white hover:bg-black">Subscribe</Button>
            </div>
            <p className="text-xs text-[#9c9791] mt-4">No spam, unsubscribe anytime.</p>
        </div>
    )
}

// 18. Shopify Product Showcase
function ShopifyProductShowcase() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold">Jenny's Picks</h2>
                <p className="text-gray-500 text-sm">Curated products I use and love.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden rounded-lg relative">
                            <img src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1527864550417-7fd91fc51a46' : '1556228453-efd6c1ff04f6'}?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-black hover:text-white transition-colors">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-sm font-bold truncate">Essential Creator Gear {i}</h3>
                        <p className="text-xs text-gray-500">$120.00</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 19. Crowdfunding Campaign Style
function CrowdfundingCampaignStyle() {
    return (
        <div className="border rounded-xl p-6 bg-white">
            <div className="flex gap-2 mb-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>
                <span className="text-xs text-gray-500 flex items-center">Ends in 12 days</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">2024 World Tour Documentary</h2>
            <p className="text-gray-600 text-sm mb-6">Help me produce a high-quality documentary film about sustainable travel across 5 continents.</p>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-bold">
                    <span>$4,500 raised</span>
                    <span className="text-gray-400">of $10,000</span>
                </div>
                <Progress value={45} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                    <div className="font-black text-xl">125</div>
                    <div className="text-[10px] text-gray-400 uppercase">Backers</div>
                </div>
                <div className="border-l border-r">
                    <div className="font-black text-xl">12</div>
                    <div className="text-[10px] text-gray-400 uppercase">Days Left</div>
                </div>
                <div>
                    <div className="font-black text-xl">45%</div>
                    <div className="text-[10px] text-gray-400 uppercase">Funded</div>
                </div>
            </div>

            <Button className="w-full font-bold h-12 text-lg">Back this Project</Button>
        </div>
    )
}

// 20. NFT Artist Gallery
function NFTArtistGallery() {
    return (
        <div className="bg-black text-white p-6 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full"></div>
                    <span className="font-mono font-bold">JENNY.ETH</span>
                </div>
                <div className="text-xs text-gray-500 font-mono">0x3f...8a2b</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-2 hover:border-pink-500 transition-colors cursor-pointer group">
                        <div className="aspect-square bg-gray-800 rounded mb-2 overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                            <div className="text-gray-400">#00{i}</div>
                            <div className="font-bold text-pink-500">0.5 ETH</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
