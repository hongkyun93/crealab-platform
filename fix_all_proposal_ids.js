const fs = require('fs');
const path = './supabase/migrations/00_master_schema_v6.sql';
let sql = fs.readFileSync(path, 'utf8');

// 1. can_access_submission_feedback() 수정
sql = sql.replace(
    /CREATE FUNCTION public\.can_access_submission_feedback\(p_proposal_id uuid\) RETURNS boolean([\s\S]*?)END;\n\$\$;/g,
    `CREATE FUNCTION public.can_access_submission_feedback(p_workspace_id uuid) RETURNS boolean
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
$$;`
);

// 2. complete_settlement() 수정
sql = sql.replace(
    /CREATE FUNCTION public\.complete_settlement\(p_proposal_id text, p_proposal_type text\) RETURNS void([\s\S]*?)END;\n\$\$;/g,
    `CREATE FUNCTION public.complete_settlement(p_workspace_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.settlements
  SET final_completed_at = NOW(),
      updated_at = NOW()
  WHERE workspace_id = p_workspace_id
    AND final_completed_at IS NULL;
END;
$$;`
);

// 3. create_settlement_on_approval() 수정
sql = sql.replace(
    /CREATE FUNCTION public\.create_settlement_on_approval\(p_proposal_id text, p_proposal_type text, p_brand_id uuid, p_creator_id uuid, p_gross_amount integer\) RETURNS uuid([\s\S]*?)END;\n\$\$;/g,
    `CREATE FUNCTION public.create_settlement_on_approval(p_workspace_id uuid, p_brand_id uuid, p_creator_id uuid, p_gross_amount integer) RETURNS uuid
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
$$;`
);

// 4. settlements 테이블 정의 수정 (proposal_id -> workspace_id)
sql = sql.replace(/    proposal_type text NOT NULL,\n    proposal_id uuid NOT NULL, -- 원래 text 였으나 uuid로 수정 \(원래 제안서 참조용\)/g, '    workspace_id uuid NOT NULL,');

// 5. workspace_files 인덱스 및 외래키 제거
sql = sql.replace(/-- Name: workspace_files_brand_proposal_id_idx; Type: INDEX; Schema: public; Owner: -[\s\S]*?CREATE INDEX workspace_files_brand_proposal_id_idx ON public\.workspace_files USING btree \(brand_proposal_id\);/g, '');
sql = sql.replace(/-- Name: workspace_files_moment_proposal_id_idx; Type: INDEX; Schema: public; Owner: -[\s\S]*?CREATE INDEX workspace_files_moment_proposal_id_idx ON public\.workspace_files USING btree \(moment_proposal_id\);/g, '');
sql = sql.replace(/-- Name: workspace_files_proposal_id_idx; Type: INDEX; Schema: public; Owner: -[\s\S]*?CREATE INDEX workspace_files_proposal_id_idx ON public\.workspace_files USING btree \(proposal_id\);/g, '');
sql = sql.replace(/-- Name: workspace_files workspace_files_brand_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -[\s\S]*?ALTER TABLE ONLY public\.workspace_files\n\s*ADD CONSTRAINT workspace_files_brand_proposal_id_fkey FOREIGN KEY \(brand_proposal_id\) REFERENCES public\.product_applications\(id\) ON DELETE CASCADE;/g, '');

fs.writeFileSync(path, sql, 'utf8');
console.log('Fixed all old proposal ID references');
