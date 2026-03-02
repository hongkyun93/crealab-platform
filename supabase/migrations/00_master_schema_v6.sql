-- =====================================================
-- 👑 MASTER SCHEMA V6.0 — Single Source of Truth
-- =====================================================
-- Last Updated: 2026-02-25
-- Reflects EXACT Supabase Database State.
-- Created via pg_dump
-- =====================================================

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


-- Drop all existing tables to allow clean recreation
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;



--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

-- COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'brand',
            'creator',
            'admin'
        );
    END IF;
END
$$;


--
-- Name: accept_invitation(uuid); Type: FUNCTION; Schema: public; Owner: -

-- RESTORED FUNCTION: notify_influencer_on_brand_offer
CREATE OR REPLACE FUNCTION public.notify_influencer_on_brand_offer() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    brand_name TEXT;
BEGIN
    IF NEW.status = 'offered' THEN
        SELECT display_name INTO brand_name
        FROM profiles WHERE id = NEW.brand_id;
        
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.creator_id,
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
$$;

-- RESTORED FUNCTION: notify_influencer_on_moment_proposal
CREATE OR REPLACE FUNCTION public.notify_influencer_on_moment_proposal() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    moment_title TEXT;
    brand_name TEXT;
BEGIN
    SELECT title INTO moment_title
    FROM life_moments WHERE id = NEW.moment_id;
    
    SELECT display_name INTO brand_name
    FROM profiles WHERE id = NEW.brand_id;
    
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.creator_id,
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
$$;

-- RESTORED FUNCTION: notify_brand_on_product_application
CREATE OR REPLACE FUNCTION public.notify_brand_on_product_application() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    creator_name TEXT;
BEGIN
    IF NEW.status IN ('applied', 'pending') THEN
        SELECT display_name INTO creator_name
        FROM profiles WHERE id = NEW.creator_id;
        
        INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
        VALUES (
            NEW.brand_id,
            NEW.creator_id,
            'product_application',
            COALESCE(creator_name, '크리에이터') || '님이 "' || COALESCE(NEW.product_name, '제품') || '" 제품에 신청했습니다.',
            NEW.id::text
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create product application notification: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- RESTORED FUNCTION: handle_new_team
CREATE OR REPLACE FUNCTION public.handle_new_team() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (new.id, auth.uid(), 'owner')
      ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

-- RESTORED FUNCTION: set_proposal_team_ids
CREATE OR REPLACE FUNCTION public.set_proposal_team_ids() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- 2. Life Moments (Target: team_id)
    IF TG_TABLE_NAME = 'life_moments' THEN
        IF NEW.team_id IS NULL THEN
            -- A. Common Team (Agency Mode)
            NEW.team_id := (
                SELECT tm.team_id
                FROM public.team_members tm
                JOIN public.team_members agent_tm ON tm.team_id = agent_tm.team_id
                WHERE tm.user_id = NEW.creator_id
                AND agent_tm.user_id = auth.uid()
                LIMIT 1
            );
            
            -- B. Owner Team (Self Mode)
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.creator_id
                    AND role = 'owner'
                    LIMIT 1
                );
            END IF;
            
            -- C. Any Team (Fallback)
            IF NEW.team_id IS NULL THEN
                NEW.team_id := (
                    SELECT team_id FROM public.team_members
                    WHERE user_id = NEW.creator_id
                    LIMIT 1
                );
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;




-- RESTORED FUNCTION: notify_user_on_message
CREATE OR REPLACE FUNCTION public.notify_user_on_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    sender_name TEXT;
BEGIN
    SELECT display_name INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;
    
    INSERT INTO notifications (recipient_id, sender_id, type, content, reference_id)
    VALUES (
        NEW.receiver_id,
        NEW.sender_id,
        'message_received',
        sender_name || '님이 메시지를 보냈습니다: ' || LEFT(NEW.content, 20) || '...',
        NEW.id
    );
    
    RETURN NEW;
END;
$$;

--




-- RESTORED FUNCTION: is_admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- RESTORED FUNCTION: get_user_team_ids
CREATE OR REPLACE FUNCTION public.get_user_team_ids(target_user_id uuid) RETURNS SETOF uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    SET LOCAL row_security = off;
    RETURN QUERY 
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = target_user_id;
END;
$$;

-- RESTORED FUNCTION: is_team_owner_or_admin
CREATE OR REPLACE FUNCTION public.is_team_owner_or_admin(target_team_id uuid, target_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    SET LOCAL row_security = off;
    
    SELECT role INTO user_role
    FROM public.team_members
    WHERE team_id = target_team_id AND user_id = target_user_id
    LIMIT 1;
    
    RETURN (user_role = 'owner' OR user_role = 'admin');
END;
$$;

CREATE FUNCTION public.accept_invitation(invitation_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    invite_record RECORD;
    current_email TEXT;
    user_uid UUID;
    is_member BOOLEAN;
BEGIN
    current_email := auth.jwt() ->> 'email';
    user_uid := auth.uid();

    -- Fetch the invitation securely
    SELECT * INTO invite_record
    FROM public.team_invitations
    WHERE id = invitation_id
    AND email = current_email
    AND status = 'pending'
    AND expires_at > now();

    IF invite_record.id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Add user to team
    -- 2. Check if already a member of THIS team
    SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = invite_record.team_id AND user_id = user_uid) INTO is_member;
    
    IF is_member THEN
        -- Already member, just mark accepted
        UPDATE public.team_invitations
        SET status = 'accepted'
        WHERE id = invitation_id;
        RETURN TRUE;
    END IF;

    -- 3. Leave ANY other teams (Enforce single team membership)
    DELETE FROM public.team_members WHERE user_id = user_uid;

    -- 4. Add to new team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (invite_record.team_id, user_uid, invite_record.role);

    -- 5. Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted'
    WHERE id = invitation_id;
    
    RETURN TRUE;
END;
$$;


--
-- Name: add_team_member_direct(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_team_member_direct(target_email text, target_role text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    current_user_id UUID;
    target_user_id UUID;
    user_team_id UUID;
    is_authorized BOOLEAN;
BEGIN
    current_user_id := auth.uid();
    
    -- 1. Get current user's team
    SELECT team_id INTO user_team_id 
    FROM public.team_members 
    WHERE user_id = current_user_id 
    LIMIT 1;
    
    IF user_team_id IS NULL THEN
        -- Check if user created a team
        SELECT id INTO user_team_id 
        FROM public.teams 
        WHERE created_by = current_user_id 
        LIMIT 1;
    END IF;
    
    IF user_team_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '소속된 팀이 없습니다.');
    END IF;
    
    -- 2. Check permissions (must be owner/manager/admin OR team creator)
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = user_team_id 
        AND user_id = current_user_id 
        AND role IN ('owner', 'manager', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = user_team_id
        AND created_by = current_user_id
    ) INTO is_authorized;
    
    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'message', '팀원 추가 권한이 없습니다.');
    END IF;
    
    -- 3. Find target user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '해당 이메일의 사용자를 찾을 수 없습니다. 먼저 가입이 필요합니다.');
    END IF;
    
    -- 4. Check if already a member
    IF EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = user_team_id 
        AND user_id = target_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 팀 멤버입니다.');
    END IF;
    
    -- 5. Remove from any existing teams (enforce single team membership)
    DELETE FROM public.team_members WHERE user_id = target_user_id;
    
    -- 6. Add to team
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (user_team_id, target_user_id, target_role);
    
    RETURN jsonb_build_object('success', true, 'message', '팀원이 추가되었습니다.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', '오류 발생: ' || SQLERRM);
END;
$$;


--
-- Name: can_access_submission_feedback(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_access_submission_feedback(p_workspace_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_uid         uuid := auth.uid();
    v_brand_id    uuid;
    v_creator_id  uuid;
    v_team_id     uuid;
BEGIN
    IF v_uid IS NULL THEN RETURN false; END IF;

    SELECT brand_id, creator_id
    INTO   v_brand_id, v_creator_id
    FROM   public.workspaces
    WHERE  id = p_workspace_id
    LIMIT  1;

    IF v_brand_id IS NULL THEN RETURN false; END IF;

    -- 직접 당사자면 true
    IF v_uid = v_brand_id OR v_uid = v_creator_id THEN
        RETURN true;
    END IF;

    -- 브랜드의 팀 소속인지
    SELECT team_id INTO v_team_id
    FROM   public.team_members
    WHERE  user_id = v_uid AND team_id = (SELECT team_id FROM public.team_members WHERE user_id = v_brand_id LIMIT 1)
    LIMIT  1;
    IF v_team_id IS NOT NULL THEN RETURN true; END IF;

    -- 크리에이터의 팀 소속인지
    SELECT team_id INTO v_team_id
    FROM   public.team_members
    WHERE  user_id = v_uid AND team_id = (SELECT team_id FROM public.team_members WHERE user_id = v_creator_id LIMIT 1)
    LIMIT  1;
    IF v_team_id IS NOT NULL THEN RETURN true; END IF;

    RETURN false;
END;
$$;


--
-- Name: complete_settlement(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.complete_settlement(p_workspace_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.settlements
  SET final_completed_at = NOW(),
      updated_at = NOW()
  WHERE workspace_id = p_workspace_id
    AND final_completed_at IS NULL;
END;
$$;


--
-- Name: create_settlement_on_approval(text, text, uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_settlement_on_approval(p_workspace_id uuid, p_brand_id uuid, p_creator_id uuid, p_gross_amount integer) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_team_id       uuid;
  v_split_ratio   numeric(4,3) := 1.000;
  v_creator_amount integer;
  v_mcn_amount     integer;
  v_wh_amount      integer;
  v_net_amount     integer;
  v_month          text;
  v_settlement_id  uuid;
BEGIN
  SELECT team_id INTO v_team_id FROM public.profiles WHERE id = p_creator_id;

  IF v_team_id IS NOT NULL THEN
    SELECT split_ratio INTO v_split_ratio FROM public.mcn_revenue_splits WHERE team_id = v_team_id AND creator_id = p_creator_id;
    IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
  END IF;

  v_creator_amount := ROUND(p_gross_amount * v_split_ratio);
  v_mcn_amount     := p_gross_amount - v_creator_amount;
  v_wh_amount      := ROUND(v_creator_amount * 0.033);
  v_net_amount     := v_creator_amount - v_wh_amount;
  v_month          := TO_CHAR(NOW(), 'YYYY-MM');

  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, workspace_id, gross_amount, split_ratio, creator_amount, mcn_amount, withholding_rate, withholding_amount, net_creator_amount, settlement_month, status
  ) VALUES (
    v_team_id, p_creator_id, p_brand_id, p_workspace_id, p_gross_amount, v_split_ratio, v_creator_amount, v_mcn_amount, 0.033, v_wh_amount, v_net_amount, v_month, 'pending'
  ) RETURNING id INTO v_settlement_id;

  RETURN v_settlement_id;
END;
$$;


--
-- Name: enforce_single_primary_channel(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_single_primary_channel() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If setting this channel as primary
    IF NEW.is_primary = true THEN
        -- Unset any other primary channels for this user
        UPDATE public.social_channels
        SET is_primary = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_primary = true;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: exec_sql(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_sql(sql text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Security check: Ensure only service_role can execute this
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied. Service role required.';
  END IF;

  -- Execute the SQL
  EXECUTE sql;
END;
$$;


COMMENT ON FUNCTION public.exec_sql(sql text) IS 'Executes arbitrary SQL. Restricted to service_role.';


--
-- Name: force_null_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.force_null_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  NEW.role := NULL;
  RETURN NEW;
END;
$$;


--
-- Name: generate_invite_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.generate_invite_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        -- If email exists, use it for uniqueness. Otherwise, use team_id + timestamp
        IF NEW.email IS NOT NULL THEN
            NEW.invite_code := substring(md5(random()::text || NEW.email || now()::text) from 1 for 12);
        ELSE
            NEW.invite_code := substring(md5(random()::text || NEW.team_id::text || now()::text) from 1 for 12);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_auto_create_settlement(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_auto_create_settlement() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_creator_id    uuid;
  v_brand_id      uuid;
  v_price_offer   integer;
  v_team_id       uuid;
  v_split_ratio   numeric(4,3);
  v_gross         integer;
  v_creator_amt   integer;
  v_mcn_amt       integer;
  v_withhold_rate numeric(5,4) := 0.033;
  v_withhold_amt  integer;
  v_net_amt       integer;
  v_prop_type     text;
  v_prop_id       text;
  v_month         text;
BEGIN
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'product_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'product_application';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'moment_proposals' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := NEW.brand_id;
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'moment_proposal';
    v_prop_id     := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'campaign_applications' THEN
    v_creator_id  := NEW.creator_id;
    v_brand_id    := (SELECT brand_id FROM public.campaigns WHERE id = NEW.campaign_id LIMIT 1);
    v_price_offer := COALESCE(NEW.price_offer, 0);
    v_prop_type   := 'campaign_application';
    v_prop_id     := NEW.id::text;
  ELSE
    RETURN NEW;
  END IF;

  -- 2. Validate price
  IF v_price_offer <= 0 THEN RETURN NEW; END IF;
  v_gross := v_price_offer;

  -- 3. MCN Team resolving
  SELECT team_id INTO v_team_id FROM public.profiles WHERE id = v_creator_id;

  -- 4. Split Ratio
  IF v_team_id IS NOT NULL THEN
    SELECT split_ratio INTO v_split_ratio
    FROM public.mcn_revenue_splits
    WHERE team_id = v_team_id AND creator_id = v_creator_id;

    IF NOT FOUND THEN v_split_ratio := 0.700; END IF;
  ELSE
    v_split_ratio := 1.000;
  END IF;

  -- 5. Calculate amounts
  v_creator_amt := ROUND(v_gross * v_split_ratio);
  v_mcn_amt     := v_gross - v_creator_amt;
  v_withhold_amt:= ROUND(v_creator_amt * v_withhold_rate);
  v_net_amt     := v_creator_amt - v_withhold_amt;
  v_month       := TO_CHAR(NOW(), 'YYYY-MM');

  -- 6. Insert into settlements
  INSERT INTO public.settlements (
    team_id, creator_id, brand_id, workspace_id,
    proposal_type, proposal_id,
    gross_amount, split_ratio,
    creator_amount, mcn_amount,
    withholding_rate, withholding_amount,
    net_creator_amount, settlement_month, status
  )
  VALUES (
    v_team_id, v_creator_id, v_brand_id, NEW.workspace_id,
    v_prop_type, v_prop_id,
    v_gross, v_split_ratio,
    v_creator_amt, v_mcn_amt,
    v_withhold_rate, v_withhold_amt,
    v_net_amt, v_month, 'pending'
  );

  RETURN NEW;
END;
$$;


--
-- Name: update_social_channels_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_social_channels_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: upsert_revenue_split(uuid, uuid, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.upsert_revenue_split(target_team_id uuid, target_creator_id uuid, new_ratio numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.mcn_revenue_splits (team_id, creator_id, split_ratio)
  VALUES (target_team_id, target_creator_id, new_ratio)
  ON CONFLICT (team_id, creator_id) DO UPDATE
    SET split_ratio = new_ratio,
        effective_from = CURRENT_DATE;
END;
$$;


--
-- Name: user_belongs_to_team(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_belongs_to_team(target_team_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = target_team_id
    AND user_id = auth.uid()
  );
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_deletions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_deletions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text,
    reason text,
    deleted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brand_deposits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_deposits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    balance_after integer NOT NULL,
    reference_id text,
    reference_type text,
    note text,
    confirmed_by uuid,
    confirmed_at timestamp with time zone,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brand_deposits_amount_check CHECK ((amount > 0)),
    CONSTRAINT brand_deposits_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text]))),
    CONSTRAINT brand_deposits_type_check CHECK ((type = ANY (ARRAY['charge'::text, 'use'::text, 'refund'::text])))
);


--
-- Name: brand_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    price integer DEFAULT 0,
    category text,
    selling_points text,
    required_shots text,
    website_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_mock boolean DEFAULT false,
    content_guide text,
    format_guide text,
    tags text[],
    account_tag text,
    team_id uuid,
    channels text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true
);


--
-- Name: campaign_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_applications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    message text,
    price_offer integer,
    status text DEFAULT 'pending'::text,
    motivation text,
    content_plan text,
    portfolio_links text[],
    instagram_handle text,
    insight_screenshot text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    compensation_amount text,
    has_incentive boolean DEFAULT false,
    incentive_detail text,
    content_type text,
    moment_id uuid,

    product_name text,
    product_type text DEFAULT 'gift'::text,
    channel_name text,
    channel_subtype text,
    secondary_usage_fee integer DEFAULT 0,
    workspace_id uuid
);





--
-- Name: campaign_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    views integer,
    likes integer,
    comments integer,
    shares integer,
    saves integer,
    reach integer,
    engagement_rate numeric(6,2),
    cpe numeric(10,2),
    cpr numeric(10,2),
    utm_clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    revenue_generated numeric(12,2),
    screenshot_url text,
    submitted_by uuid,
    submitted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    brand_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    product_name text NOT NULL,
    product_image_url text,
    budget_min integer,
    budget_max integer,
    target_moment_id uuid,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    moment_date text,
    posting_date text,
    category text,
    budget text,
    target text,
    tags text[],
    image text,
    recruitment_count integer,
    recruitment_deadline text,
    channels text[],
    reference_link text,
    hashtags text[],
    selection_announcement_date text,
    min_followers integer,
    max_followers integer,
    team_id uuid,
    product_type text DEFAULT 'gift'::text,
    CONSTRAINT campaigns_product_type_check CHECK ((product_type = ANY (ARRAY['gift'::text, 'loan'::text])))
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    target_id uuid NOT NULL,
    target_type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_target_type CHECK ((target_type = ANY (ARRAY['product'::text, 'campaign'::text, 'profile'::text, 'event'::text])))
);


--
-- Name: life_moments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.life_moments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    creator_id uuid,
    title text DEFAULT ''::text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    target_product text,
    status text DEFAULT 'recruiting'::text,
    is_private boolean DEFAULT false,
    schedule jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    category text,
    is_verified boolean DEFAULT false,
    is_mock boolean DEFAULT false,
    guide text,
    date_flexible boolean DEFAULT false,
    team_id uuid,
    channels text[] DEFAULT '{}'::text[],
    moment_start_date date,
    moment_end_date date,
    posting_date_exact date
);


--
-- Name: mcn_revenue_splits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mcn_revenue_splits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    split_ratio numeric(4,3) DEFAULT 0.700 NOT NULL,
    effective_from date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mcn_revenue_splits_split_ratio_check CHECK (((split_ratio >= (0)::numeric) AND (split_ratio <= (1)::numeric)))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    workspace_id uuid NOT NULL,
    sender_id uuid,
    receiver_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_mock boolean DEFAULT false,
    file_url text,
    file_name text,
    file_size integer,
    file_type text
);


--
-- Name: moment_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.moment_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    moment_id uuid NOT NULL,
    product_id uuid,
    message text,
    conditions jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'offered'::text,
    workspace_id uuid
);





--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    recipient_id uuid NOT NULL,
    sender_id uuid,
    type text NOT NULL,
    content text NOT NULL,
    reference_id uuid,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: product_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_applications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    brand_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    product_id uuid NOT NULL,
    moment_id uuid,
    message text,
    status text DEFAULT 'offered'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    motivation text,
    content_plan text,
    portfolio_links text[],
    insight_screenshot text,
    workspace_id uuid
);





--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    role text DEFAULT 'creator'::public.user_role,
    display_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    website text,
    is_mock boolean DEFAULT false,
    phone text,
    address text,
    handle text,
    onboarding_completed boolean DEFAULT false,
    followers_count bigint DEFAULT 0,
    tags text[] DEFAULT '{}'::text[],
    tier text DEFAULT 'Nano'::text,
    price_video bigint DEFAULT 0,
    price_feed bigint DEFAULT 0,
    secondary_rights boolean DEFAULT false,
    usage_rights_month integer DEFAULT 0,
    usage_rights_price bigint DEFAULT 0,
    auto_dm_month integer DEFAULT 0,
    auto_dm_price bigint DEFAULT 0,
    instagram_handle text,
    bank_name text,
    account_number text,
    account_holder text,
    primary_region text,
    price_story integer DEFAULT 0,
    price_usage_rights integer DEFAULT 0,
    price_auto_dm integer DEFAULT 0,
    shipping_address text,
    description text,
    representative_name text,
    business_number text,
    company_address text,
    company_phone text,
    tax_email text,
    business_category text,
    business_type text,
    contact_person_name text,
    contact_person_phone text,
    contact_person_email text,
    settlement_bank text,
    legal_name text,
    birth_date text,
    legal_address text,
    is_business_registered boolean DEFAULT false,
    creator_business_number text,
    deposit_balance integer DEFAULT 0
);


--
-- Name: COLUMN profiles.onboarding_completed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True if user has completed initial onboarding. New signups default to false.';


--
-- Name: COLUMN profiles.followers_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.followers_count IS 'Instagram followers count';


--
-- Name: COLUMN profiles.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.tags IS 'Creator category tags';


--
-- Name: COLUMN profiles.price_video; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.price_video IS 'Video rate';


--
-- Name: COLUMN profiles.price_feed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.price_feed IS '피드 포스팅 단가';


--
-- Name: COLUMN profiles.primary_region; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.primary_region IS '주요 활동 지역 (예: 서울, 부산, 전국)';


--
-- Name: COLUMN profiles.price_story; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.price_story IS '스토리 게시 단가';


--
-- Name: COLUMN profiles.price_usage_rights; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.price_usage_rights IS '2차 활용권 단가';


--
-- Name: COLUMN profiles.price_auto_dm; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.price_auto_dm IS '자동 DM 발송 단가';


--
-- Name: COLUMN profiles.shipping_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.shipping_address IS '제품 배송지 주소';


--
-- Name: settlements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settlements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    creator_id uuid NOT NULL,
    brand_id uuid,
    workspace_id uuid NOT NULL,
    gross_amount integer DEFAULT 0 NOT NULL,
    split_ratio numeric(4,3) DEFAULT 0.700 NOT NULL,
    creator_amount integer DEFAULT 0 NOT NULL,
    mcn_amount integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp with time zone,
    settlement_month text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    withholding_rate numeric(5,4) DEFAULT 0.033 NOT NULL,
    withholding_amount integer DEFAULT 0 NOT NULL,
    net_creator_amount integer DEFAULT 0 NOT NULL,
    statement_number text,
    final_completed_at timestamp with time zone,
    performance_submitted_at timestamp with time zone,
    CONSTRAINT settlements_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'paid'::text, 'cancelled'::text])))
);


--
-- Name: social_channels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_channels (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    platform text NOT NULL,
    handle text NOT NULL,
    followers_count integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    ig_user_id text,
    ig_access_token text,
    ig_demographics jsonb,
    CONSTRAINT social_channels_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'youtube'::text, 'blog'::text, 'tiktok'::text, 'other'::text])))
);


--
-- Name: TABLE social_channels; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.social_channels IS '크리에이터 소셜 채널 관리 테이블';


--
-- Name: COLUMN social_channels.platform; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.social_channels.platform IS '소셜 플랫폼 종류: instagram, youtube, blog, tiktok, other';


--
-- Name: COLUMN social_channels.handle; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.social_channels.handle IS '플랫폼별 계정 ID (@username)';


--
-- Name: COLUMN social_channels.followers_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.social_channels.followers_count IS '팔로워/구독자 수';


--
-- Name: COLUMN social_channels.is_primary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.social_channels.is_primary IS '메인 채널 여부 (하나만 true)';


--
-- Name: COLUMN social_channels.is_public; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.social_channels.is_public IS '브랜드에게 공개 여부';


--
-- Name: submission_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submission_feedback (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    workspace_id uuid NOT NULL,
    sender_id uuid,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    video_timestamp_seconds numeric(8,2)
);


--
-- Name: COLUMN submission_feedback.video_timestamp_seconds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.submission_feedback.video_timestamp_seconds IS 'If set, this feedback is a video bookmark at the given second. NULL = plain text feedback.';


--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_invitations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    team_id uuid NOT NULL,
    email text,
    role text DEFAULT 'member'::text,
    created_by uuid,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    invite_code text,
    invited_by uuid,
    CONSTRAINT team_invitations_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'creator'::text, 'manager'::text, 'employee'::text])))
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT team_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'creator'::text, 'manager'::text, 'employee'::text])))
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    logo_url text,
    website text,
    business_registration_number text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    representative_name text,
    business_address text,
    stamp_url text
);


--
-- Name: workspace_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    uploader_id uuid,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    file_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    original_proposal_id uuid,
    original_proposal_type text,
    project_title text, -- UI 표기용 이름 (캠페인명, 제품명, 모먼트명)
    
    -- 기본 상태
    status text DEFAULT 'in_progress'::text,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    
    -- 팀 참조 (MCN 등)


    
    -- 가격/조건 합의
    price_offer bigint,
    product_type text DEFAULT 'gift'::text,
    receiver_name text,
    secondary_usage_fee integer DEFAULT 0,
    date_flexible boolean DEFAULT false,
    desired_date date,
    video_guide text DEFAULT 'brand_provided'::text,
    
    -- 제안 커스텀 조건 (날짜류 텍스트 저장용)
    condition_product_receipt_date text,
    condition_plan_sharing_date text,
    condition_draft_submission_date text,
    condition_final_submission_date text,
    condition_upload_date text,
    condition_maintenance_period text,
    condition_secondary_usage_period text,
    
    brand_condition_confirmed boolean DEFAULT false,
    creator_condition_confirmed boolean DEFAULT false,
    
    -- 계약 정보
    contract_status text DEFAULT 'none'::text,
    contract_content text,
    brand_signature text,
    creator_signature text,
    brand_signed_at timestamp with time zone,
    creator_signed_at timestamp with time zone,
    
    -- 배송 정보
    shipping_name text,
    shipping_phone text,
    shipping_address text,
    tracking_number text,
    delivery_status text DEFAULT 'pending'::text,
    
    -- 제출 에셋 (1차, 2차, 최종, 클린)
    content_submission_status text DEFAULT 'pending'::text,
    content_submission_url text,
    content_submission_file_url text,
    content_submission_date timestamp with time zone,
    content_submission_version numeric(3,1) DEFAULT 1.0,
    
    content_submission_status_2 text DEFAULT 'pending'::text,
    content_submission_url_2 text,
    content_submission_file_url_2 text,
    content_submission_date_2 timestamp with time zone,
    content_submission_version_2 numeric(3,1) DEFAULT 0.9,
    
    content_final_url text,
    content_clean_url text,
    content_final_approved_at timestamp with time zone,
    content_revision_requested_at timestamp with time zone,
    
    -- 정산 정보
    payment_confirmed_at timestamp with time zone,
    
    CONSTRAINT workspaces_product_type_check CHECK ((product_type = ANY (ARRAY['gift'::text, 'loan'::text])))
);


--
-- Name: account_deletions account_deletions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_deletions
    ADD CONSTRAINT account_deletions_pkey PRIMARY KEY (id);


--
-- Name: brand_deposits brand_deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_deposits
    ADD CONSTRAINT brand_deposits_pkey PRIMARY KEY (id);


--
-- Name: brand_products brand_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_products
    ADD CONSTRAINT brand_products_pkey PRIMARY KEY (id);


--
-- Name: product_applications brand_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_applications
    ADD CONSTRAINT brand_proposals_pkey PRIMARY KEY (id);


--
-- Name: campaign_applications campaign_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT campaign_applications_pkey PRIMARY KEY (id);


--
-- Name: campaign_performance campaign_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_performance
    ADD CONSTRAINT campaign_performance_pkey PRIMARY KEY (id);


--
-- Name: campaign_performance campaign_performance_workspace_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_performance
    ADD CONSTRAINT campaign_performance_workspace_id_key UNIQUE (workspace_id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_target_id_target_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_target_id_target_type_key UNIQUE (user_id, target_id, target_type);





--
-- Name: life_moments life_moments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.life_moments
    ADD CONSTRAINT life_moments_pkey PRIMARY KEY (id);


--
-- Name: mcn_revenue_splits mcn_revenue_splits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mcn_revenue_splits
    ADD CONSTRAINT mcn_revenue_splits_pkey PRIMARY KEY (id);


--
-- Name: mcn_revenue_splits mcn_revenue_splits_team_id_creator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mcn_revenue_splits
    ADD CONSTRAINT mcn_revenue_splits_team_id_creator_id_key UNIQUE (team_id, creator_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: moment_proposals moment_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: social_channels social_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_channels
    ADD CONSTRAINT social_channels_pkey PRIMARY KEY (id);


--
-- Name: submission_feedback submission_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_feedback
    ADD CONSTRAINT submission_feedback_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invite_code_key UNIQUE (invite_code);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_team_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_email_key UNIQUE (team_id, email);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams teams_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_slug_key UNIQUE (slug);


--
-- Name: social_channels unique_user_platform_handle; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_channels
    ADD CONSTRAINT unique_user_platform_handle UNIQUE (user_id, platform, handle);


--
-- Name: workspace_files workspace_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_files
    ADD CONSTRAINT workspace_files_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_brand_deposits_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_deposits_brand_id ON public.brand_deposits USING btree (brand_id);


--
-- Name: idx_brand_deposits_brand_id_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_deposits_brand_id_created ON public.brand_deposits USING btree (brand_id, created_at DESC);


--
-- Name: idx_brand_deposits_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_deposits_status ON public.brand_deposits USING btree (status);


--
-- Name: idx_brand_deposits_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_deposits_type ON public.brand_deposits USING btree (type);


--
-- Name: idx_brand_products_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_products_brand_id ON public.brand_products USING btree (brand_id);


--
-- Name: idx_brand_products_channels; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_products_channels ON public.brand_products USING gin (channels);


--
-- Name: idx_brand_products_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_products_lookup ON public.brand_products USING btree (id, brand_id);


--
-- Name: INDEX idx_brand_products_lookup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_brand_products_lookup IS 'Optimizes brand products JOIN queries in brand proposals';


--





--
-- Name: idx_brand_proposals_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_proposals_lookup ON public.product_applications USING btree (brand_id, creator_id, status) WHERE (status = ANY (ARRAY['offered'::text, 'pending'::text, 'accepted'::text, 'confirmed'::text]));


--
-- Name: INDEX idx_brand_proposals_lookup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_brand_proposals_lookup IS 'Optimizes brand proposal queries by brand_id, creator_id, and status';


--





--
-- Name: idx_campaign_performance_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_performance_brand ON public.campaign_performance USING btree (brand_id);


--
-- Name: idx_campaign_performance_creator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_performance_creator ON public.campaign_performance USING btree (creator_id);


--
-- Name: idx_campaign_performance_workspace_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_performance_workspace_id ON public.campaign_performance USING btree (workspace_id);


--
-- Name: idx_favorites_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_target ON public.favorites USING btree (target_id, target_type);


--
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- Name: idx_life_moments_channels; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_channels ON public.life_moments USING gin (channels);


--
-- Name: idx_life_moments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_created_at ON public.life_moments USING btree (created_at DESC);


--
-- Name: idx_life_moments_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_creator_id ON public.life_moments USING btree (creator_id);


--
-- Name: idx_life_moments_is_private; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_is_private ON public.life_moments USING btree (is_private);


--
-- Name: idx_life_moments_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_lookup ON public.life_moments USING btree (creator_id, moment_start_date);


--
-- Name: INDEX idx_life_moments_lookup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_life_moments_lookup IS 'Optimizes life moments JOIN queries in moment proposals';


--
-- Name: idx_life_moments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_life_moments_status ON public.life_moments USING btree (status);








--
-- Name: idx_moment_proposals_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moment_proposals_lookup ON public.moment_proposals USING btree (brand_id, creator_id, status);


--
-- Name: INDEX idx_moment_proposals_lookup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_moment_proposals_lookup IS 'Optimizes moment proposal queries by brand_id, creator_id, and status';


--
-- Name: idx_profiles_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_lookup ON public.profiles USING btree (id);


--
-- Name: INDEX idx_profiles_lookup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_profiles_lookup IS 'Optimizes profile JOIN queries in proposals';


--
-- Name: idx_social_channels_ig_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_social_channels_ig_user_id ON public.social_channels USING btree (ig_user_id) WHERE (ig_user_id IS NOT NULL);


--
-- Name: idx_social_channels_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_social_channels_is_primary ON public.social_channels USING btree (user_id, is_primary);


--
-- Name: idx_social_channels_platform; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_social_channels_platform ON public.social_channels USING btree (platform);


--
-- Name: idx_social_channels_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_social_channels_user_id ON public.social_channels USING btree (user_id);


--
-- Name: idx_team_invitations_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_code ON public.team_invitations USING btree (invite_code);


--
-- Name: idx_team_invitations_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_email ON public.team_invitations USING btree (email);


--
-- Name: idx_team_invitations_invite_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_invite_code ON public.team_invitations USING btree (invite_code);


--
-- Name: idx_team_invitations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_status ON public.team_invitations USING btree (status);


--
-- Name: idx_team_invitations_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_invitations_team_id ON public.team_invitations USING btree (team_id);


--
-- Name: idx_team_members_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_members_team_id ON public.team_members USING btree (team_id);


--
-- Name: idx_team_members_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_members_user_id ON public.team_members USING btree (user_id);


--



--



--



--
-- Name: workspace_files_workspace_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workspace_files_workspace_id_idx ON public.workspace_files USING btree (workspace_id);


--
-- Name: social_channels enforce_single_primary_channel_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enforce_single_primary_channel_trigger BEFORE INSERT OR UPDATE ON public.social_channels FOR EACH ROW EXECUTE FUNCTION public.enforce_single_primary_channel();


--
-- Name: team_invitations ensure_invite_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ensure_invite_code BEFORE INSERT ON public.team_invitations FOR EACH ROW EXECUTE FUNCTION public.generate_invite_code();


--
-- Name: profiles on_auth_user_created_force_null_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_auth_user_created_force_null_role BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.force_null_role();


--
-- Name: product_applications on_brand_offer; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_brand_offer AFTER INSERT ON public.product_applications FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_on_brand_offer();


--
-- Name: messages on_message_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_message_created AFTER INSERT ON public.messages FOR EACH ROW WHEN ((new.sender_id IS DISTINCT FROM new.receiver_id)) EXECUTE FUNCTION public.notify_user_on_message();


--
-- Name: moment_proposals on_moment_proposal; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_moment_proposal AFTER INSERT ON public.moment_proposals FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_on_moment_proposal();


--
-- Name: product_applications on_product_application; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_product_application AFTER INSERT ON public.product_applications FOR EACH ROW EXECUTE FUNCTION public.notify_brand_on_product_application();


--
-- Name: teams on_team_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_team_created AFTER INSERT ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();


--
-- Name: campaign_applications trg_settlement_on_campaign_app_complete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_settlement_on_campaign_app_complete AFTER UPDATE OF status ON public.campaign_applications FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();


--
-- Name: moment_proposals trg_settlement_on_moment_proposal_complete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_settlement_on_moment_proposal_complete AFTER UPDATE OF status ON public.moment_proposals FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();


--
-- Name: product_applications trg_settlement_on_product_application_complete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_settlement_on_product_application_complete AFTER UPDATE OF status ON public.product_applications FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_settlement();


--
-- Name: life_moments trigger_set_life_moments_team_id; Type: TRIGGER; Schema: public; Owner: -
--

-- Name: life_moments trigger_set_life_moments_team_id; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_life_moments_team_id BEFORE INSERT ON public.life_moments FOR EACH ROW EXECUTE FUNCTION public.set_proposal_team_ids();


--
-- Name: life_moments update_life_moments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_life_moments_updated_at BEFORE UPDATE ON public.life_moments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: social_channels update_social_channels_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_social_channels_updated_at_trigger BEFORE UPDATE ON public.social_channels FOR EACH ROW EXECUTE FUNCTION public.update_social_channels_updated_at();


--
-- Name: brand_deposits brand_deposits_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_deposits
    ADD CONSTRAINT brand_deposits_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: brand_deposits brand_deposits_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_deposits
    ADD CONSTRAINT brand_deposits_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.profiles(id);


--
-- Name: brand_products brand_products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_products
    ADD CONSTRAINT brand_products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: brand_products brand_products_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_products
    ADD CONSTRAINT brand_products_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: product_applications brand_proposals_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_applications
    ADD CONSTRAINT brand_proposals_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id);





-- Name: product_applications brand_proposals_moment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--


--
-- Name: product_applications brand_proposals_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_applications
    ADD CONSTRAINT brand_proposals_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id);


--





--
-- Name: product_applications brand_proposals_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_applications
    ADD CONSTRAINT brand_proposals_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.brand_products(id);


--
-- Name: product_applications brand_proposals_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_applications
    ADD CONSTRAINT brand_proposals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: campaign_applications campaign_applications_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT campaign_applications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaign_applications campaign_applications_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT campaign_applications_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id);


--





--
-- Name: campaign_applications campaign_applications_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_applications
    ADD CONSTRAINT campaign_applications_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: campaign_performance campaign_performance_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_performance
    ADD CONSTRAINT campaign_performance_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: campaign_performance campaign_performance_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_performance
    ADD CONSTRAINT campaign_performance_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: campaign_performance campaign_performance_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_performance
    ADD CONSTRAINT campaign_performance_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id);


--
-- Name: campaigns campaigns_target_moment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_target_moment_id_fkey FOREIGN KEY (target_moment_id) REFERENCES public.life_moments(id);


--
-- Name: campaigns campaigns_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;





--
-- Name: life_moments life_moments_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.life_moments
    ADD CONSTRAINT life_moments_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: life_moments life_moments_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.life_moments
    ADD CONSTRAINT life_moments_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: mcn_revenue_splits mcn_revenue_splits_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mcn_revenue_splits
    ADD CONSTRAINT mcn_revenue_splits_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: mcn_revenue_splits mcn_revenue_splits_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mcn_revenue_splits
    ADD CONSTRAINT mcn_revenue_splits_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: moment_proposals moment_proposals_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id);





--
-- Name: moment_proposals moment_proposals_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id);


--





--
-- Name: moment_proposals moment_proposals_moment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_moment_id_fkey FOREIGN KEY (moment_id) REFERENCES public.life_moments(id);


--
-- Name: moment_proposals moment_proposals_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.brand_products(id);


--
-- Name: moment_proposals moment_proposals_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.moment_proposals
    ADD CONSTRAINT moment_proposals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id);


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: settlements settlements_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: settlements settlements_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- Name: settlements settlements_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;


--
-- Name: social_channels social_channels_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_channels
    ADD CONSTRAINT social_channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: submission_feedback submission_feedback_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submission_feedback
    ADD CONSTRAINT submission_feedback_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: team_invitations team_invitations_invited_by_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_fkey1 FOREIGN KEY (invited_by) REFERENCES public.profiles(id);


--
-- Name: team_invitations team_invitations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: teams teams_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--



--
-- Name: workspace_files workspace_files_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_files
    ADD CONSTRAINT workspace_files_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: workspaces workspaces_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES auth.users(id);


--
-- Name: workspaces workspaces_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id);


--
-- Name: account_deletions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_applications admin_read_campaign_applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_campaign_applications ON public.campaign_applications FOR SELECT USING (public.is_admin());


--
-- Name: life_moments admin_read_life_moments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_life_moments ON public.life_moments FOR SELECT USING (public.is_admin());


--
-- Name: moment_proposals admin_read_moment_proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_moment_proposals ON public.moment_proposals FOR SELECT USING (public.is_admin());


--
-- Name: product_applications admin_read_product_applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_product_applications ON public.product_applications FOR SELECT USING (public.is_admin());


--
-- Name: profiles admin_read_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_profiles ON public.profiles FOR SELECT USING (public.is_admin());


--
-- Name: settlements admin_read_settlements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_settlements ON public.settlements FOR SELECT USING (public.is_admin());


--
-- Name: workspaces admin_read_workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_read_workspaces ON public.workspaces FOR SELECT USING (public.is_admin());


--
-- Name: campaign_applications admin_update_campaign_applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_update_campaign_applications ON public.campaign_applications FOR UPDATE USING (public.is_admin());


--
-- Name: moment_proposals admin_update_moment_proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_update_moment_proposals ON public.moment_proposals FOR UPDATE USING (public.is_admin());


--
-- Name: product_applications admin_update_product_applications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_update_product_applications ON public.product_applications FOR UPDATE USING (public.is_admin());


--
-- Name: settlements admin_update_settlements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_update_settlements ON public.settlements FOR UPDATE USING (public.is_admin());


--
-- Name: brand_deposits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_deposits ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_deposits brand_deposits_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_admin_all ON public.brand_deposits USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));


--
-- Name: brand_deposits brand_deposits_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_insert ON public.brand_deposits FOR INSERT WITH CHECK (((auth.uid() = brand_id) OR public.is_admin()));


--
-- Name: brand_deposits brand_deposits_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_insert_own ON public.brand_deposits FOR INSERT WITH CHECK (((brand_id = auth.uid()) AND (type = ANY (ARRAY['charge'::text, 'use'::text]))));


--
-- Name: brand_deposits brand_deposits_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_read_own ON public.brand_deposits FOR SELECT USING ((brand_id = auth.uid()));


--
-- Name: brand_deposits brand_deposits_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_select ON public.brand_deposits FOR SELECT USING (((auth.uid() = brand_id) OR public.is_admin()));


--
-- Name: brand_deposits brand_deposits_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_deposits_update ON public.brand_deposits FOR UPDATE USING (public.is_admin());


--
-- Name: brand_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_products ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_products brand_products_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_products_delete ON public.brand_products FOR DELETE USING (((auth.uid() = brand_id) OR public.is_admin()));


--
-- Name: brand_products brand_products_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_products_insert ON public.brand_products FOR INSERT WITH CHECK ((auth.uid() = brand_id));


--
-- Name: brand_products brand_products_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_products_select ON public.brand_products FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: brand_products brand_products_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_products_update ON public.brand_products FOR UPDATE USING (((auth.uid() = brand_id) OR public.is_admin()));


--
-- Name: product_applications brand_proposals_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_proposals_delete ON public.product_applications FOR DELETE TO authenticated USING (((auth.uid() = brand_id) ));


--
-- Name: product_applications brand_proposals_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_proposals_insert ON public.product_applications FOR INSERT TO authenticated WITH CHECK (((auth.uid() = brand_id) ));


--
-- Name: product_applications brand_proposals_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_proposals_select ON public.product_applications FOR SELECT TO authenticated USING (((auth.uid() = brand_id) OR (auth.uid() = creator_id)  ));


--
-- Name: product_applications brand_proposals_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_proposals_update ON public.product_applications FOR UPDATE TO authenticated USING (((auth.uid() = brand_id) OR (auth.uid() = creator_id)  ));


--
-- Name: moment_proposals brand_update_moment_proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_update_moment_proposals ON public.moment_proposals FOR UPDATE USING ((brand_id = auth.uid())) WITH CHECK ((brand_id = auth.uid()));


--
-- Name: campaign_performance brand_update_performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_update_performance ON public.campaign_performance FOR UPDATE USING (((brand_id = auth.uid()) OR public.is_admin()));


--
-- Name: campaign_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: campaign_applications campaign_apps_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaign_apps_delete ON public.campaign_applications FOR DELETE TO authenticated USING (((auth.uid() = creator_id) ));


--
-- Name: campaign_applications campaign_apps_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaign_apps_insert ON public.campaign_applications FOR INSERT TO authenticated WITH CHECK (((auth.uid() = creator_id) ));


--
-- Name: campaign_applications campaign_apps_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaign_apps_select ON public.campaign_applications FOR SELECT TO authenticated USING (((auth.uid() = creator_id)  OR (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = campaign_applications.campaign_id) AND ((c.brand_id = auth.uid()) OR (c.team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))))))));


--
-- Name: campaign_applications campaign_apps_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaign_apps_update ON public.campaign_applications FOR UPDATE TO authenticated USING (((auth.uid() = creator_id)  OR (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = campaign_applications.campaign_id) AND ((c.brand_id = auth.uid()) OR (c.team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))))))));


--
-- Name: campaign_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns_delete_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaigns_delete_team ON public.campaigns FOR DELETE TO authenticated USING (((auth.uid() = brand_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: campaigns campaigns_insert_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaigns_insert_team ON public.campaigns FOR INSERT TO authenticated WITH CHECK (((auth.uid() = brand_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: campaigns campaigns_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaigns_select_authenticated ON public.campaigns FOR SELECT TO authenticated USING (true);


--
-- Name: campaigns campaigns_update_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaigns_update_team ON public.campaigns FOR UPDATE TO authenticated USING (((auth.uid() = brand_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: campaign_performance creator_insert_performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY creator_insert_performance ON public.campaign_performance FOR INSERT WITH CHECK ((creator_id = auth.uid()));


--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites favorites_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY favorites_delete ON public.favorites FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: favorites favorites_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY favorites_insert ON public.favorites FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: favorites favorites_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY favorites_select ON public.favorites FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: moment_proposals influencer_update_moment_proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY influencer_update_moment_proposals ON public.moment_proposals FOR UPDATE USING ((creator_id = auth.uid())) WITH CHECK ((creator_id = auth.uid()));





--
-- Name: team_invitations invitations_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invitations_delete ON public.team_invitations FOR DELETE TO authenticated USING (public.is_team_owner_or_admin(team_id, auth.uid()));


--
-- Name: team_invitations invitations_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invitations_insert ON public.team_invitations FOR INSERT TO authenticated WITH CHECK (public.is_team_owner_or_admin(team_id, auth.uid()));


--
-- Name: team_invitations invitations_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invitations_select ON public.team_invitations FOR SELECT TO authenticated USING (((email = (auth.jwt() ->> 'email'::text)) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: team_invitations invitations_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY invitations_update ON public.team_invitations FOR UPDATE TO authenticated USING (public.is_team_owner_or_admin(team_id, auth.uid()));


--
-- Name: life_moments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.life_moments ENABLE ROW LEVEL SECURITY;

--
-- Name: life_moments life_moments_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY life_moments_delete ON public.life_moments FOR DELETE USING (((creator_id = auth.uid()) OR public.is_admin()));


--
-- Name: life_moments life_moments_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY life_moments_insert ON public.life_moments FOR INSERT WITH CHECK (((creator_id = auth.uid()) OR public.is_admin()));


--
-- Name: life_moments life_moments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY life_moments_select ON public.life_moments FOR SELECT USING (((is_private = false) OR (creator_id = auth.uid()) OR public.is_admin() OR (EXISTS ( SELECT 1
   FROM (public.team_members tm_viewer
     JOIN public.team_members tm_owner ON ((tm_owner.team_id = tm_viewer.team_id)))
  WHERE ((tm_viewer.user_id = auth.uid()) AND (tm_owner.user_id = life_moments.creator_id))))));


--
-- Name: life_moments life_moments_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY life_moments_update ON public.life_moments FOR UPDATE USING (((creator_id = auth.uid()) OR public.is_admin() OR (EXISTS ( SELECT 1
   FROM (public.team_members tm_viewer
     JOIN public.team_members tm_owner ON ((tm_owner.team_id = tm_viewer.team_id)))
  WHERE ((tm_viewer.user_id = auth.uid()) AND (tm_viewer.role = ANY (ARRAY['owner'::text, 'admin'::text])) AND (tm_owner.user_id = life_moments.creator_id))))));


--
-- Name: team_members manage_team_members_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manage_team_members_delete ON public.team_members FOR DELETE USING (public.is_team_owner_or_admin(team_id, auth.uid()));


--
-- Name: team_members manage_team_members_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manage_team_members_insert ON public.team_members FOR INSERT WITH CHECK ((public.is_team_owner_or_admin(team_id, auth.uid()) OR public.is_team_owner_or_admin(team_id, auth.uid())));


--
-- Name: team_members manage_team_members_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manage_team_members_update ON public.team_members FOR UPDATE USING (public.is_team_owner_or_admin(team_id, auth.uid())) WITH CHECK (public.is_team_owner_or_admin(team_id, auth.uid()));


--
-- Name: mcn_revenue_splits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mcn_revenue_splits ENABLE ROW LEVEL SECURITY;

--
-- Name: mcn_revenue_splits mcn_revenue_splits_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mcn_revenue_splits_insert ON public.mcn_revenue_splits FOR INSERT WITH CHECK ((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE ((team_members.user_id = auth.uid()) AND (team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: mcn_revenue_splits mcn_revenue_splits_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mcn_revenue_splits_select ON public.mcn_revenue_splits FOR SELECT USING ((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE (team_members.user_id = auth.uid()))));


--
-- Name: mcn_revenue_splits mcn_revenue_splits_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY mcn_revenue_splits_update ON public.mcn_revenue_splits FOR UPDATE USING ((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE ((team_members.user_id = auth.uid()) AND (team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: messages messages_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_insert ON public.messages FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: messages messages_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_select ON public.messages FOR SELECT USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- Name: messages messages_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY messages_update ON public.messages FOR UPDATE USING ((auth.uid() = receiver_id)) WITH CHECK ((auth.uid() = receiver_id));


--
-- Name: moment_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.moment_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: moment_proposals moment_proposals_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moment_proposals_delete ON public.moment_proposals FOR DELETE TO authenticated USING (((auth.uid() = brand_id) OR (auth.uid() = creator_id)  ));


--
-- Name: moment_proposals moment_proposals_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moment_proposals_insert ON public.moment_proposals FOR INSERT TO authenticated WITH CHECK (((auth.uid() = brand_id) ));


--
-- Name: moment_proposals moment_proposals_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moment_proposals_select ON public.moment_proposals FOR SELECT TO authenticated USING (((auth.uid() = brand_id) OR (auth.uid() = creator_id)  ));


--
-- Name: moment_proposals moment_proposals_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moment_proposals_update ON public.moment_proposals FOR UPDATE TO authenticated USING (((auth.uid() = brand_id) OR (auth.uid() = creator_id)  ));


--
-- Name: life_moments moments_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moments_delete ON public.life_moments FOR DELETE TO authenticated USING (((auth.uid() = creator_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: life_moments moments_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moments_insert ON public.life_moments FOR INSERT TO authenticated WITH CHECK (((auth.uid() = creator_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: life_moments moments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moments_select ON public.life_moments FOR SELECT TO authenticated USING (((is_private = false) OR (auth.uid() = creator_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: life_moments moments_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY moments_update ON public.life_moments FOR UPDATE TO authenticated USING (((auth.uid() = creator_id) OR (team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = recipient_id));


--
-- Name: notifications notifications_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = recipient_id));


--
-- Name: moment_proposals participants_select_moment_proposals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY participants_select_moment_proposals ON public.moment_proposals FOR SELECT USING (((creator_id = auth.uid()) OR (brand_id = auth.uid()) OR public.is_admin()));


--
-- Name: product_applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_products products_delete_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_delete_team ON public.brand_products FOR DELETE TO authenticated USING (((team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids)) OR (auth.uid() = brand_id)));


--
-- Name: brand_products products_insert_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_insert_team ON public.brand_products FOR INSERT TO authenticated WITH CHECK (((team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids)) OR (auth.uid() = brand_id)));


--
-- Name: brand_products products_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_select_authenticated ON public.brand_products FOR SELECT TO authenticated USING (true);


--
-- Name: brand_products products_update_team; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_update_team ON public.brand_products FOR UPDATE TO authenticated USING (((team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids)) OR (auth.uid() = brand_id)));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: profiles profiles_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select_authenticated ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: profiles profiles_update_self_or_manager; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_self_or_manager ON public.profiles FOR UPDATE TO authenticated USING (((auth.uid() = id) OR ((id IN ( SELECT tm_target.user_id
   FROM public.team_members tm_target
  WHERE (tm_target.team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids)))) AND public.is_team_owner_or_admin(( SELECT tm2.team_id
   FROM public.team_members tm2
  WHERE (tm2.user_id = profiles.id)
 LIMIT 1), auth.uid()))));


--
-- Name: campaign_performance select_own_performance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_own_performance ON public.campaign_performance FOR SELECT USING (((brand_id = auth.uid()) OR (creator_id = auth.uid()) OR public.is_admin()));


--
-- Name: settlements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

--
-- Name: settlements settlements_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY settlements_insert ON public.settlements FOR INSERT WITH CHECK ((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE ((team_members.user_id = auth.uid()) AND (team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: settlements settlements_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY settlements_select ON public.settlements FOR SELECT USING (((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE (team_members.user_id = auth.uid()))) OR (creator_id = auth.uid()) OR (brand_id = auth.uid())));


--
-- Name: settlements settlements_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY settlements_update ON public.settlements FOR UPDATE USING ((team_id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE ((team_members.user_id = auth.uid()) AND (team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: social_channels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;

--
-- Name: social_channels social_channels_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY social_channels_delete ON public.social_channels FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: social_channels social_channels_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY social_channels_insert ON public.social_channels FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: social_channels social_channels_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY social_channels_select ON public.social_channels FOR SELECT TO authenticated USING (true);


--
-- Name: social_channels social_channels_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY social_channels_update ON public.social_channels FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: submission_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.submission_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: submission_feedback submission_feedback_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY submission_feedback_insert ON public.submission_feedback FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: submission_feedback submission_feedback_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY submission_feedback_select ON public.submission_feedback FOR SELECT USING ((auth.uid() = sender_id) OR public.can_access_submission_feedback(workspace_id));


--
-- Name: submission_feedback submission_feedback_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY submission_feedback_update ON public.submission_feedback FOR UPDATE USING ((auth.uid() = sender_id));


--
-- Name: team_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: teams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

--
-- Name: teams teams_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: teams teams_members_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_members_select ON public.teams FOR SELECT USING ((id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE (team_members.user_id = auth.uid()))));


--
-- Name: teams teams_owner_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_owner_update ON public.teams FOR UPDATE USING ((id IN ( SELECT team_members.team_id
   FROM public.team_members
  WHERE ((team_members.user_id = auth.uid()) AND (team_members.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: teams teams_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_select ON public.teams FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids))));


--
-- Name: teams teams_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated USING (((created_by = auth.uid()) OR public.is_team_owner_or_admin(id, auth.uid())));


--
-- Name: team_members view_team_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY view_team_members ON public.team_members FOR SELECT USING ((team_id IN ( SELECT public.get_user_team_ids(auth.uid()) AS get_user_team_ids)));


--
-- Name: workspaces workspace members can insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "workspace members can insert" ON public.workspaces FOR INSERT WITH CHECK (((brand_id = auth.uid()) OR (creator_id = auth.uid())));


--
-- Name: workspaces workspace members can view; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "workspace members can view" ON public.workspaces FOR SELECT USING (((brand_id = auth.uid()) OR (creator_id = auth.uid())));


--
-- Name: workspace_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_files workspace_files_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY workspace_files_delete ON public.workspace_files FOR DELETE USING ((auth.uid() = uploader_id));


--
-- Name: workspace_files workspace_files_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY workspace_files_insert ON public.workspace_files FOR INSERT WITH CHECK ((auth.uid() = uploader_id));


--
-- Name: workspace_files workspace_files_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY workspace_files_select ON public.workspace_files FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


