export type AdContestStatus = 'draft' | 'funding_pending' | 'active' | 'in_progress' | 'evaluating' | 'completed';
export type AdContestApplicationStatus = 'applied' | 'selected' | 'rejected' | 'video_submitted' | 'feedback_required' | 'video_approved' | 'uploaded' | 'completed';

export interface AdContest {
    id: string;
    brand_id: string;
    title: string;
    categories: string[];
    product_id: string | null;
    product_name: string | null;
    product_image_url: string | null;
    product_link: string | null;
    thumbnail_url: string | null;
    platforms: string[];
    allow_mirroring: boolean;

    // Schedule
    recruit_start_date: string | null;
    recruit_end_date: string | null;
    challenger_announce_date: string | null;
    video_submit_start_date: string | null;
    video_submit_end_date: string | null;
    video_review_start_date: string | null;
    video_review_end_date: string | null;
    video_upload_start_date: string | null;
    video_upload_end_date: string | null;
    reaction_test_start_date: string | null;
    reaction_test_end_date: string | null;
    award_start_date: string | null;
    award_end_date: string | null;
    winner_announce_date: string | null;

    // Budget & Rewards
    target_challenger_count: number;
    base_reward: number;
    rank_rewards: Record<string, { count: number; amount: number }>;
    total_budget: number;

    // Guidelines
    video_length: string | null;
    video_ratio: string | null;
    video_resolution: string | null;
    required_hashtags: string[];
    selling_points: string[];
    required_cuts: string[];
    forbidden_rules: string[];
    caution_notes: string[];

    status: AdContestStatus;
    created_at: string;
    updated_at: string;
}

export interface AdContestApplication {
    id: string;
    contest_id: string;
    creator_id: string;
    status: AdContestApplicationStatus;
    instagram_id: string | null;
    awarded_rank: number | null;

    appeal_message: string | null;
    shipping_address: any | null;
    agreed_to_rules: boolean;

    video_draft_url: string | null;
    feedback_count: number;
    final_video_link: string | null;
    performance_metrics: any | null;

    created_at: string;
    updated_at: string;
}
