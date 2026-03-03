-- life_moments 컬럼명을 moment_proposals.conditions 키 기준으로 통일
ALTER TABLE life_moments
    RENAME COLUMN guide TO video_guide;

ALTER TABLE life_moments
    RENAME COLUMN posting_date_exact TO condition_upload_date;
