-- Brand Business Profile Fields
-- Add 11 new columns to the profiles table for brand-specific business information

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS representative_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_category text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_person_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_person_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_person_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settlement_bank text;

-- Creator Business Profile Fields
-- Add 4 new columns for creator-specific legal/tax information

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legal_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legal_address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_business_registered boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_business_number text;

-- Update RPC to return new fields
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public VOLATILE
AS $$
DECLARE
    current_user_id UUID;
    result json;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN RETURN NULL; END IF;

    SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'role', p.role,
        'name', COALESCE(p.display_name, split_part(p.email, '@', 1)),
        'avatar', p.avatar_url,
        'onboardingCompleted', COALESCE(p.onboarding_completed, false),
        'bio', p.description,
        'handle', p.instagram_handle,
        'followers', COALESCE(p.followers_count, 0),
        'tags', COALESCE(p.tags, '{}'::text[]),
        'phone', p.phone,
        'address', p.shipping_address,
        'website', p.website,
        'primaryRegion', p.primary_region,
        'priceVideo', COALESCE(p.price_video, 0),
        'priceFeed', COALESCE(p.price_feed, 0),
        'priceStory', COALESCE(p.price_story, 0),
        'priceUsageRights', COALESCE(p.price_usage_rights, 0),
        'priceAutoDm', COALESCE(p.price_auto_dm, 0),
        'teamId', (SELECT team_id FROM public.team_members WHERE user_id = current_user_id LIMIT 1),
        'bankName', p.bank_name,
        'accountNumber', p.account_number,
        'accountHolder', p.account_holder,
        'usageRightsMonth', COALESCE(p.usage_rights_month, 0),
        'usageRightsPrice', COALESCE(p.usage_rights_price, 0),
        'autoDmMonth', COALESCE(p.auto_dm_month, 0),
        'autoDmPrice', COALESCE(p.auto_dm_price, 0),
        -- Brand Business Fields
        'representativeName', p.representative_name,
        'businessNumber', p.business_number,
        'companyAddress', p.company_address,
        'companyPhone', p.company_phone,
        'taxEmail', p.tax_email,
        'businessCategory', p.business_category,
        'businessType', p.business_type,
        'contactPersonName', p.contact_person_name,
        'contactPersonPhone', p.contact_person_phone,
        'contactPersonEmail', p.contact_person_email,
        'settlementBank', p.settlement_bank,
        -- Creator Legal/Tax Fields
        'legalName', p.legal_name,
        'birthDate', p.birth_date,
        'legalAddress', p.legal_address,
        'isBusinessRegistered', COALESCE(p.is_business_registered, false),
        'creatorBusinessNumber', p.creator_business_number
    ) INTO result
    FROM public.profiles p
    WHERE p.id = current_user_id;

    RETURN result;
END;
$$;
