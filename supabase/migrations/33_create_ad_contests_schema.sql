-- Create ad_contests table
CREATE TABLE public.ad_contests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',
    product_id UUID REFERENCES public.brand_products(id) ON DELETE SET NULL,
    product_name TEXT,
    product_image_url TEXT,
    product_link TEXT,
    thumbnail_url TEXT,
    platforms TEXT[] NOT NULL DEFAULT '{}',
    allow_mirroring BOOLEAN NOT NULL DEFAULT false,
    
    -- Schedule
    recruit_start_date TIMESTAMPTZ,
    recruit_end_date TIMESTAMPTZ,
    challenger_announce_date TIMESTAMPTZ,
    video_submit_start_date TIMESTAMPTZ,
    video_submit_end_date TIMESTAMPTZ,
    video_review_start_date TIMESTAMPTZ,
    video_review_end_date TIMESTAMPTZ,
    video_upload_start_date TIMESTAMPTZ,
    video_upload_end_date TIMESTAMPTZ,
    reaction_test_start_date TIMESTAMPTZ,
    reaction_test_end_date TIMESTAMPTZ,
    award_start_date TIMESTAMPTZ,
    award_end_date TIMESTAMPTZ,
    winner_announce_date TIMESTAMPTZ,
    
    -- Budget & Rewards
    target_challenger_count INTEGER NOT NULL DEFAULT 0,
    base_reward INTEGER NOT NULL DEFAULT 0,
    rank_rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_budget INTEGER NOT NULL DEFAULT 0,
    
    -- Guidelines
    video_length TEXT,
    video_ratio TEXT,
    video_resolution TEXT,
    required_hashtags TEXT[] NOT NULL DEFAULT '{}',
    selling_points TEXT[] NOT NULL DEFAULT '{}',
    required_cuts TEXT[] NOT NULL DEFAULT '{}',
    forbidden_rules TEXT[] NOT NULL DEFAULT '{}',
    caution_notes TEXT[] NOT NULL DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft', -- draft, funding_pending, active, in_progress, evaluating, completed
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ad_contest_applications table
CREATE TABLE public.ad_contest_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contest_id UUID NOT NULL REFERENCES public.ad_contests(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    status TEXT NOT NULL DEFAULT 'applied', -- applied, selected, rejected, video_submitted, feedback_required, video_approved, uploaded, completed
    awarded_rank INTEGER,
    
    appeal_message TEXT,
    shipping_address JSONB,
    agreed_to_rules BOOLEAN NOT NULL DEFAULT false,
    
    video_draft_url TEXT,
    feedback_count INTEGER NOT NULL DEFAULT 0,
    final_video_link TEXT,
    performance_metrics JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate applications per creator per contest
    UNIQUE(contest_id, creator_id)
);

-- RLS Policies for ad_contests
ALTER TABLE public.ad_contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ad_contests"
    ON public.ad_contests
    FOR SELECT
    USING (status != 'draft' OR auth.uid() = brand_id);

CREATE POLICY "Brands can insert their own ad_contests"
    ON public.ad_contests
    FOR INSERT
    WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own ad_contests"
    ON public.ad_contests
    FOR UPDATE
    USING (auth.uid() = brand_id)
    WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can delete their own draft ad_contests"
    ON public.ad_contests
    FOR DELETE
    USING (auth.uid() = brand_id AND status = 'draft');

-- RLS Policies for ad_contest_applications
ALTER TABLE public.ad_contest_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view applications for their contests"
    ON public.ad_contest_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ad_contests
            WHERE id = contest_id AND brand_id = auth.uid()
        )
    );

CREATE POLICY "Creators can view their own applications"
    ON public.ad_contest_applications
    FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own applications"
    ON public.ad_contest_applications
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own applications"
    ON public.ad_contest_applications
    FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Brands can update applications for their contests"
    ON public.ad_contest_applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.ad_contests
            WHERE id = contest_id AND brand_id = auth.uid()
        )
    );

-- Functions & Triggers
-- Updated_at trigger functionality
CREATE OR REPLACE FUNCTION update_ad_contests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ad_contests_updated_at
BEFORE UPDATE ON public.ad_contests
FOR EACH ROW EXECUTE FUNCTION update_ad_contests_updated_at();

CREATE TRIGGER update_ad_contest_applications_updated_at
BEFORE UPDATE ON public.ad_contest_applications
FOR EACH ROW EXECUTE FUNCTION update_ad_contests_updated_at();

-- RPC for Escrow Payment
CREATE OR REPLACE FUNCTION create_contest_escrow(
    p_contest_id UUID,
    p_brand_id UUID,
    p_total_amount INTEGER -- Amount to deduct (budget + fees + tax)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_credit_balance INTEGER;
    v_contest RECORD;
BEGIN
    -- Check if contest exists and belongs to brand
    SELECT * INTO v_contest FROM public.ad_contests 
    WHERE id = p_contest_id AND brand_id = p_brand_id AND status = 'draft';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid contest, brand, or status.');
    END IF;

    -- Get brand's total credit balance
    SELECT COALESCE(SUM(amount), 0) INTO v_credit_balance
    FROM public.billing_history
    WHERE brand_id = p_brand_id;

    -- Check if balance is sufficient
    IF v_credit_balance < p_total_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient balance.',
            'required', p_total_amount,
            'current', v_credit_balance
        );
    END IF;

    -- Deduct from billing_history
    INSERT INTO public.billing_history (
        brand_id, 
        amount, 
        type, 
        description, 
        reference_id
    ) VALUES (
        p_brand_id, 
        -p_total_amount, 
        'contest_escrow', 
        '콘테스트 상금 및 예치금 에스크로 결제', 
        p_contest_id::text
    );

    -- Update contest status to active
    UPDATE public.ad_contests
    SET status = 'active'
    WHERE id = p_contest_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
