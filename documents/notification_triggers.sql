-- ==========================================
-- NOTIFICATION SYSTEM - DATABASE TRIGGERS
-- ==========================================
-- This file contains triggers to automatically create notifications
-- when key business events occur in the platform.
--
-- Hybrid Approach:
-- - Triggers: Core events (applications, proposals)
-- - Client: Complex interactions (feedback, contracts, content submission)

-- ==========================================
-- 1. CAMPAIGN APPLICATION NOTIFICATION
-- ==========================================
-- Notify brand when an influencer applies to their campaign

CREATE OR REPLACE FUNCTION notify_brand_on_campaign_application()
RETURNS TRIGGER AS $$
DECLARE
    brand_user_id UUID;
    campaign_name TEXT;
    influencer_name TEXT;
BEGIN
    -- Get brand_id and campaign name from campaign
    SELECT c.brand_id, c.product_name INTO brand_user_id, campaign_name
    FROM campaigns c WHERE c.id = NEW.campaign_id;
    
    -- Get influencer name
    SELECT display_name INTO influencer_name
    FROM profiles WHERE id = NEW.influencer_id;
    
    -- Send notification to brand
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        brand_user_id,
        NEW.influencer_id,
        'campaign_application',
        COALESCE(influencer_name, '크리에이터') || '님이 "' || COALESCE(campaign_name, '캠페인') || '" 캠페인에 지원했습니다.',
        NEW.id::text
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the insert
        RAISE WARNING 'Failed to create campaign application notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_campaign_application ON campaign_proposals;

-- Create trigger
CREATE TRIGGER on_campaign_application
AFTER INSERT ON campaign_proposals
FOR EACH ROW EXECUTE FUNCTION notify_brand_on_campaign_application();

-- ==========================================
-- 2. MOMENT PROPOSAL NOTIFICATION
-- ==========================================
-- Notify influencer when a brand proposes on their moment

CREATE OR REPLACE FUNCTION notify_influencer_on_moment_proposal()
RETURNS TRIGGER AS $$
DECLARE
    moment_title TEXT;
    brand_name TEXT;
BEGIN
    -- Get moment title
    SELECT title INTO moment_title
    FROM life_moments WHERE id = NEW.moment_id;
    
    -- Get brand name
    SELECT display_name INTO brand_name
    FROM profiles WHERE id = NEW.brand_id;
    
    -- Send notification to influencer
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.influencer_id,
        NEW.brand_id,
        'moment_proposal',
        COALESCE(brand_name, '브랜드') || '님이 "' || COALESCE(moment_title, '모먼트') || '" 모먼트에 제안했습니다.',
        NEW.id::text
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create moment proposal notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_moment_proposal ON moment_proposals;

CREATE TRIGGER on_moment_proposal
AFTER INSERT ON moment_proposals
FOR EACH ROW EXECUTE FUNCTION notify_influencer_on_moment_proposal();

-- ==========================================
-- 3. PRODUCT APPLICATION NOTIFICATION
-- ==========================================
-- Notify brand when an influencer applies to their product
-- Note: We need to distinguish between brand offering (brand_id = auth) 
-- vs influencer applying (influencer_id = auth)

CREATE OR REPLACE FUNCTION notify_brand_on_product_application()
RETURNS TRIGGER AS $$
DECLARE
    influencer_name TEXT;
BEGIN
    -- Only notify if this is a NEW insert (not an update)
    -- We check if this is likely an influencer application by checking status
    IF NEW.status IN ('applied', 'pending') THEN
        -- Get influencer name
        SELECT display_name INTO influencer_name
        FROM profiles WHERE id = NEW.influencer_id;
        
        -- Send notification to brand
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.brand_id,
            NEW.influencer_id,
            'product_application',
            COALESCE(influencer_name, '크리에이터') || '님이 "' || COALESCE(NEW.product_name, '제품') || '" 제품에 신청했습니다.',
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create product application notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_application ON brand_proposals;

CREATE TRIGGER on_product_application
AFTER INSERT ON brand_proposals
FOR EACH ROW EXECUTE FUNCTION notify_brand_on_product_application();

-- ==========================================
-- 4. BRAND OFFER NOTIFICATION
-- ==========================================
-- Notify influencer when a brand makes a direct offer

CREATE OR REPLACE FUNCTION notify_influencer_on_brand_offer()
RETURNS TRIGGER AS $$
DECLARE
    brand_name TEXT;
BEGIN
    -- Only notify if status is 'offered' (brand initiative)
    IF NEW.status = 'offered' THEN
        -- Get brand name
        SELECT display_name INTO brand_name
        FROM profiles WHERE id = NEW.brand_id;
        
        -- Send notification to influencer
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.influencer_id,
            NEW.brand_id,
            'brand_offer',
            COALESCE(brand_name, '브랜드') || '님이 "' || COALESCE(NEW.product_name, '제품') || '" 협업을 제안했습니다.',
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create brand offer notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_brand_offer ON brand_proposals;

CREATE TRIGGER on_brand_offer
AFTER INSERT ON brand_proposals
FOR EACH ROW EXECUTE FUNCTION notify_influencer_on_brand_offer();

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Use these queries to verify the triggers are working

-- Check if triggers exist
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE trigger_name IN (
    'on_campaign_application',
    'on_moment_proposal', 
    'on_product_application',
    'on_brand_offer'
)
ORDER BY event_object_table, trigger_name;

-- Check recent notifications
-- SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
