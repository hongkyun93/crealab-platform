/**
 * apply-creator-profiles-extra.mjs
 * 누락된 프로필 필드 추가 업데이트:
 * - 계좌 정보 (bank_name, account_number, account_holder)
 * - 법적 정보 (legal_name, birth_date, legal_address)
 * - 사업자 정보 (is_business_registered, creator_business_number)
 * - 배송지 (shipping_address)
 * - 2차 저작권/자동DM 단가 (usage_rights_month/price, auto_dm_month/price)
 * 
 * 실행: node scripts/apply-creator-profiles-extra.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wbeyxjoqcwjbcuwvjrsa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXl4am9xY3dqYmN1d3ZqcnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMTY2NiwiZXhwIjoyMDg1Njk3NjY2fQ.cEPlYDDi-sxR5BBYstPD_oPQ7h-5oXABhf3ER4WD610'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 한국 은행 목록
const BANKS = ['카카오뱅크', '신한은행', '국민은행', '우리은행', '하나은행', '기업은행', '농협은행', 'NH농협', 'SC제일은행', '토스뱅크']

// 서울/경기/기타 주소 풀
const ADDRESSES = {
    '서울': [
        '서울특별시 마포구 합정동 123-4', '서울특별시 성동구 성수동 456-7', '서울특별시 송파구 잠실동 789-1',
        '서울특별시 강남구 역삼동 234-5', '서울특별시 서대문구 연희동 567-8', '서울특별시 용산구 이태원동 890-2',
        '서울특별시 노원구 중계동 345-6', '서울특별시 은평구 응암동 678-9',
    ],
    '경기': [
        '경기도 성남시 분당구 정자동 123-4', '경기도 수원시 영통구 영통동 456-7', '경기도 용인시 기흥구 중동 789-1',
        '경기도 고양시 일산동구 백석동 234-5', '경기도 부천시 중동 567-8', '경기도 화성시 동탄동 890-2',
    ],
    '인천': ['인천광역시 연수구 송도동 123-4', '인천광역시 남동구 구월동 456-7'],
    '제주': ['제주특별자치도 제주시 노형동 123-4', '제주특별자치도 서귀포시 중문동 456-7'],
}

// 프로필 데이터 — email을 키로, 나머지 필드 전부
const EXTRA_DATA = [
    // 가영카페로그 (여, 1998)
    { email: 'mock_gayoungcafe@mock.creadypick.com', legal_name: '김가영', birth_date: '1998-04-12', bank_name: '카카오뱅크', account_number: '3333-12-4892710', account_holder: '김가영', is_business_registered: false, shipping_address: '서울특별시 마포구 합정동 123-4', usage_rights_month: 6, usage_rights_price: 250000, auto_dm_month: null, auto_dm_price: null },
    // 가은애플 (여, 1999)
    { email: 'mock_gaeunapple@mock.creadypick.com', legal_name: '이가은', birth_date: '1999-07-23', bank_name: '신한은행', account_number: '110-234-891023', account_holder: '이가은', is_business_registered: true, creator_business_number: '123-45-67890', shipping_address: '경기도 성남시 분당구 정자동 123-4', usage_rights_month: 12, usage_rights_price: 350000, auto_dm_month: 3, auto_dm_price: 80000 },
    // 나라몬테소리 (여, 1991)
    { email: 'mock_naramontessori@mock.creadypick.com', legal_name: '박나라', birth_date: '1991-02-14', bank_name: '국민은행', account_number: '612345-01-234567', account_holder: '박나라', is_business_registered: true, creator_business_number: '234-56-78901', shipping_address: '서울특별시 서대문구 연희동 567-8', usage_rights_month: 6, usage_rights_price: 200000, auto_dm_month: null, auto_dm_price: null },
    // 나리영어 (여, 1995)
    { email: 'mock_narienglish@mock.creadypick.com', legal_name: '최나리', birth_date: '1995-09-05', bank_name: '우리은행', account_number: '1002-234-891023', account_holder: '최나리', is_business_registered: true, creator_business_number: '345-67-89012', shipping_address: '서울특별시 강남구 역삼동 234-5', usage_rights_month: 12, usage_rights_price: 400000, auto_dm_month: 1, auto_dm_price: 120000 },
    // 나연이와꾸미 (여, 1997)
    { email: 'mock_nayeonpuppy@mock.creadypick.com', legal_name: '정나연', birth_date: '1997-11-18', bank_name: '카카오뱅크', account_number: '3333-08-7823910', account_holder: '정나연', is_business_registered: false, shipping_address: '경기도 수원시 영통구 영통동 456-7', usage_rights_month: 3, usage_rights_price: 180000, auto_dm_month: null, auto_dm_price: null },
    // 나윤호캉스 (여, 1994)
    { email: 'mock_nayunluxurytrip@mock.creadypick.com', legal_name: '윤나윤', birth_date: '1994-03-29', bank_name: '하나은행', account_number: '123-456789-01234', account_holder: '윤나윤', is_business_registered: true, creator_business_number: '456-78-90123', shipping_address: '서울특별시 용산구 이태원동 890-2', usage_rights_month: 12, usage_rights_price: 550000, auto_dm_month: 1, auto_dm_price: 160000 },
    // 다인가젯 (남, 1996)
    { email: 'mock_daingadget@mock.creadypick.com', legal_name: '김다인', birth_date: '1996-06-10', bank_name: '신한은행', account_number: '110-567-234891', account_holder: '김다인', is_business_registered: true, creator_business_number: '567-89-01234', shipping_address: '서울특별시 마포구 합정동 456-7', usage_rights_month: 6, usage_rights_price: 450000, auto_dm_month: 1, auto_dm_price: 130000 },
    // 다현핏 (여, 1998)
    { email: 'mock_dahyunfit@mock.creadypick.com', legal_name: '오다현', birth_date: '1998-01-07', bank_name: '토스뱅크', account_number: '1000-1234-5678', account_holder: '오다현', is_business_registered: true, creator_business_number: '678-90-12345', shipping_address: '서울특별시 송파구 잠실동 789-1', usage_rights_month: 6, usage_rights_price: 600000, auto_dm_month: 1, auto_dm_price: 180000 },
    // 도경플랜테리어 (여, 1997)
    { email: 'mock_dogyeongplant@mock.creadypick.com', legal_name: '임도경', birth_date: '1997-08-22', bank_name: '농협은행', account_number: '302-1234-5678-01', account_holder: '임도경', is_business_registered: false, shipping_address: '경기도 고양시 일산동구 백석동 234-5', usage_rights_month: 3, usage_rights_price: 200000, auto_dm_month: null, auto_dm_price: null },
    // 도하피아노 (여, 1999)
    { email: 'mock_dohapiano@mock.creadypick.com', legal_name: '서도하', birth_date: '1999-05-16', bank_name: '국민은행', account_number: '612345-02-345678', account_holder: '서도하', is_business_registered: false, shipping_address: '서울특별시 성동구 성수동 456-7', usage_rights_month: 6, usage_rights_price: 220000, auto_dm_month: null, auto_dm_price: null },
    // 도현테크 (남, 1994)
    { email: 'mock_dohyuntech@mock.creadypick.com', legal_name: '한도현', birth_date: '1994-12-03', bank_name: '신한은행', account_number: '110-789-567234', account_holder: '한도현', is_business_registered: true, creator_business_number: '789-01-23456', shipping_address: '서울특별시 강남구 역삼동 567-8', usage_rights_month: 12, usage_rights_price: 380000, auto_dm_month: 1, auto_dm_price: 110000 },
    // 동건머슬 (남, 1996)
    { email: 'mock_donggunmuscle@mock.creadypick.com', legal_name: '이동건', birth_date: '1996-04-19', bank_name: '우리은행', account_number: '1002-567-345891', account_holder: '이동건', is_business_registered: true, creator_business_number: '890-12-34567', shipping_address: '인천광역시 연수구 송도동 123-4', usage_rights_month: 6, usage_rights_price: 700000, auto_dm_month: 1, auto_dm_price: 200000 },
    // 라온신혼일기 (여, 1996)
    { email: 'mock_raonnewlywed@mock.creadypick.com', legal_name: '최라온', birth_date: '1996-10-28', bank_name: '카카오뱅크', account_number: '3333-09-5612340', account_holder: '최라온', is_business_registered: false, shipping_address: '경기도 용인시 기흥구 중동 789-1', usage_rights_month: 3, usage_rights_price: 150000, auto_dm_month: null, auto_dm_price: null },
    // 민규이스포츠 (남, 2001)
    { email: 'mock_mingyuesport@mock.creadypick.com', legal_name: '박민규', birth_date: '2001-02-14', bank_name: '하나은행', account_number: '123-789012-34567', account_holder: '박민규', is_business_registered: true, creator_business_number: '901-23-45678', shipping_address: '서울특별시 마포구 합정동 789-1', usage_rights_month: 12, usage_rights_price: 900000, auto_dm_month: 1, auto_dm_price: 250000 },
    // 민서맘 (여, 1992)
    { email: 'mock_minseobaby@mock.creadypick.com', legal_name: '강민서', birth_date: '1992-07-31', bank_name: '국민은행', account_number: '612345-03-456789', account_holder: '강민서', is_business_registered: false, shipping_address: '경기도 부천시 중동 567-8', usage_rights_month: 3, usage_rights_price: 170000, auto_dm_month: null, auto_dm_price: null },
    // 민지잇츠 (여, 1997)
    { email: 'mock_minjieats@mock.creadypick.com', legal_name: '조민지', birth_date: '1997-03-15', bank_name: '신한은행', account_number: '110-345-891023', account_holder: '조민지', is_business_registered: true, creator_business_number: '012-34-56789', shipping_address: '서울특별시 마포구 합정동 234-5', usage_rights_month: 6, usage_rights_price: 480000, auto_dm_month: 1, auto_dm_price: 140000 },
    // 서아리빙 (여, 1993)
    { email: 'mock_seoaliving@mock.creadypick.com', legal_name: '이서아', birth_date: '1993-11-08', bank_name: '우리은행', account_number: '1002-345-891023', account_holder: '이서아', is_business_registered: true, creator_business_number: '123-45-11111', shipping_address: '서울특별시 송파구 잠실동 345-6', usage_rights_month: 6, usage_rights_price: 400000, auto_dm_month: 1, auto_dm_price: 120000 },
    // 서영공부법 (여, 1996)
    { email: 'mock_seoyoungstudy@mock.creadypick.com', legal_name: '김서영', birth_date: '1996-08-24', bank_name: '토스뱅크', account_number: '1000-2345-6789', account_holder: '김서영', is_business_registered: true, creator_business_number: '234-56-22222', shipping_address: '서울특별시 강남구 역삼동 890-2', usage_rights_month: 12, usage_rights_price: 560000, auto_dm_month: 1, auto_dm_price: 165000 },
    // 서율솔로여행 (여, 1997)
    { email: 'mock_seoyulsolo@mock.creadypick.com', legal_name: '박서율', birth_date: '1997-06-02', bank_name: '카카오뱅크', account_number: '3333-05-7823450', account_holder: '박서율', is_business_registered: false, shipping_address: '서울특별시 은평구 응암동 678-9', usage_rights_month: 6, usage_rights_price: 350000, auto_dm_month: null, auto_dm_price: null },
    // 서진키친 (여, 1990)
    { email: 'mock_seojinkitchen@mock.creadypick.com', legal_name: '유서진', birth_date: '1990-09-17', bank_name: '농협은행', account_number: '302-5678-9012-01', account_holder: '유서진', is_business_registered: false, shipping_address: '경기도 화성시 동탄동 890-2', usage_rights_month: 3, usage_rights_price: 220000, auto_dm_month: null, auto_dm_price: null },
    // 성민개발 (남, 1993)
    { email: 'mock_sungmindev@mock.creadypick.com', legal_name: '정성민', birth_date: '1993-01-25', bank_name: '신한은행', account_number: '110-678-901234', account_holder: '정성민', is_business_registered: true, creator_business_number: '345-67-33333', shipping_address: '서울특별시 성동구 성수동 789-1', usage_rights_month: 6, usage_rights_price: 310000, auto_dm_month: 1, auto_dm_price: 96000 },
    // 소담베이킹 (여, 1996)
    { email: 'mock_sodambaking@mock.creadypick.com', legal_name: '황소담', birth_date: '1996-05-13', bank_name: '국민은행', account_number: '612345-04-567890', account_holder: '황소담', is_business_registered: false, shipping_address: '서울특별시 노원구 중계동 345-6', usage_rights_month: 3, usage_rights_price: 190000, auto_dm_month: null, auto_dm_price: null },
    // 소라갤러리 (여, 1995)
    { email: 'mock_soraculture@mock.creadypick.com', legal_name: '신소라', birth_date: '1995-07-04', bank_name: '카카오뱅크', account_number: '3333-06-4512670', account_holder: '신소라', is_business_registered: false, shipping_address: '서울특별시 용산구 이태원동 234-5', usage_rights_month: 3, usage_rights_price: 120000, auto_dm_month: null, auto_dm_price: null },
    // 수진비건 (여, 1995)
    { email: 'mock_sujinvegan@mock.creadypick.com', legal_name: '오수진', birth_date: '1995-12-21', bank_name: '토스뱅크', account_number: '1000-3456-7890', account_holder: '오수진', is_business_registered: false, shipping_address: '서울특별시 서대문구 연희동 123-4', usage_rights_month: 3, usage_rights_price: 160000, auto_dm_month: null, auto_dm_price: null },
    // 수현크립토 (남, 1991)
    { email: 'mock_suhyuncrypto@mock.creadypick.com', legal_name: '배수현', birth_date: '1991-04-07', bank_name: '하나은행', account_number: '123-012345-67890', account_holder: '배수현', is_business_registered: true, creator_business_number: '456-78-44444', shipping_address: '서울특별시 강남구 역삼동 678-9', usage_rights_month: 12, usage_rights_price: 430000, auto_dm_month: 1, auto_dm_price: 125000 },
    // 시우네고양이 (남, 1998)
    { email: 'mock_siwoocats@mock.creadypick.com', legal_name: '김시우', birth_date: '1998-10-30', bank_name: '국민은행', account_number: '612345-05-678901', account_holder: '김시우', is_business_registered: false, shipping_address: '서울특별시 마포구 합정동 890-2', usage_rights_month: 3, usage_rights_price: 160000, auto_dm_month: null, auto_dm_price: null },
    // 시은요가 (여, 1994)
    { email: 'mock_sieunyoga@mock.creadypick.com', legal_name: '문시은', birth_date: '1994-02-19', bank_name: '신한은행', account_number: '110-901-234567', account_holder: '문시은', is_business_registered: true, creator_business_number: '567-89-55555', shipping_address: '서울특별시 성동구 성수동 123-4', usage_rights_month: 6, usage_rights_price: 370000, auto_dm_month: 1, auto_dm_price: 112000 },
    // 쏘리버드 (여, 2000)
    { email: 'mock_soribirdlife@mock.creadypick.com', legal_name: '안소리', birth_date: '2000-08-11', bank_name: '카카오뱅크', account_number: '3333-07-8934510', account_holder: '안소리', is_business_registered: false, shipping_address: '경기도 수원시 영통구 영통동 789-1', usage_rights_month: 3, usage_rights_price: 95000, auto_dm_month: null, auto_dm_price: null },
    // 아린펫푸드 (여, 1996)
    { email: 'mock_arinpetfood@mock.creadypick.com', legal_name: '권아린', birth_date: '1996-03-27', bank_name: '우리은행', account_number: '1002-678-012345', account_holder: '권아린', is_business_registered: true, creator_business_number: '678-90-66666', shipping_address: '서울특별시 노원구 중계동 678-9', usage_rights_month: 6, usage_rights_price: 280000, auto_dm_month: 1, auto_dm_price: 88000 },
    // 예나쌍둥이 (여, 1990)
    { email: 'mock_yenatwins@mock.creadypick.com', legal_name: '이예나', birth_date: '1990-06-14', bank_name: '국민은행', account_number: '612345-06-789012', account_holder: '이예나', is_business_registered: false, shipping_address: '경기도 고양시 일산동구 백석동 567-8', usage_rights_month: 3, usage_rights_price: 140000, auto_dm_month: null, auto_dm_price: null },
    // 예린푸드 (여, 1997)
    { email: 'mock_yerinfood@mock.creadypick.com', legal_name: '류예린', birth_date: '1997-09-08', bank_name: '토스뱅크', account_number: '1000-4567-8901', account_holder: '류예린', is_business_registered: false, shipping_address: '서울특별시 용산구 이태원동 567-8', usage_rights_month: 3, usage_rights_price: 175000, auto_dm_month: null, auto_dm_price: null },
    // 예은워킹맘 (여, 1988)
    { email: 'mock_yeeunmom@mock.creadypick.com', legal_name: '장예은', birth_date: '1988-11-22', bank_name: '신한은행', account_number: '110-234-567891', account_holder: '장예은', is_business_registered: false, shipping_address: '서울특별시 송파구 잠실동 234-5', usage_rights_month: 3, usage_rights_price: 210000, auto_dm_month: null, auto_dm_price: null },
    // 우성구르메 (남, 1989)
    { email: 'mock_wsgourmet@mock.creadypick.com', legal_name: '백우성', birth_date: '1989-04-03', bank_name: '하나은행', account_number: '123-234567-89012', account_holder: '백우성', is_business_registered: true, creator_business_number: '789-01-77777', shipping_address: '서울특별시 강남구 역삼동 345-6', usage_rights_month: 6, usage_rights_price: 360000, auto_dm_month: 1, auto_dm_price: 108000 },
    // 우재오디오 (남, 1987)
    { email: 'mock_woojaeaudio@mock.creadypick.com', legal_name: '홍우재', birth_date: '1987-07-16', bank_name: '국민은행', account_number: '612345-07-890123', account_holder: '홍우재', is_business_registered: false, shipping_address: '인천광역시 남동구 구월동 456-7', usage_rights_month: 6, usage_rights_price: 200000, auto_dm_month: null, auto_dm_price: null },
    // 유진제주 (여, 1994)
    { email: 'mock_yujinisland@mock.creadypick.com', legal_name: '고유진', birth_date: '1994-01-31', bank_name: '카카오뱅크', account_number: '3333-10-2345670', account_holder: '고유진', is_business_registered: false, shipping_address: '제주특별자치도 제주시 노형동 123-4', usage_rights_month: 6, usage_rights_price: 310000, auto_dm_month: null, auto_dm_price: null },
    // 윤아헬스로그 (여, 1995)
    { email: 'mock_yunahealth@mock.creadypick.com', legal_name: '김윤아', birth_date: '1995-05-09', bank_name: '우리은행', account_number: '1002-789-123456', account_holder: '김윤아', is_business_registered: true, creator_business_number: '890-12-88888', shipping_address: '서울특별시 서대문구 연희동 890-2', usage_rights_month: 6, usage_rights_price: 460000, auto_dm_month: 1, auto_dm_price: 135000 },
    // 은별클린 (여, 1990)
    { email: 'mock_eunbyulclean@mock.creadypick.com', legal_name: '최은별', birth_date: '1990-12-27', bank_name: '신한은행', account_number: '110-456-789012', account_holder: '최은별', is_business_registered: true, creator_business_number: '901-23-99999', shipping_address: '경기도 용인시 기흥구 중동 234-5', usage_rights_month: 6, usage_rights_price: 390000, auto_dm_month: 1, auto_dm_price: 118000 },
    // 은서의서재 (여, 1997)
    { email: 'mock_eunseobook@mock.creadypick.com', legal_name: '임은서', birth_date: '1997-02-18', bank_name: '카카오뱅크', account_number: '3333-11-3456780', account_holder: '임은서', is_business_registered: false, shipping_address: '서울특별시 은평구 응암동 234-5', usage_rights_month: 3, usage_rights_price: 130000, auto_dm_month: null, auto_dm_price: null },
    // 은지홈쿡 (여, 1987)
    { email: 'mock_eunjihomecook@mock.creadypick.com', legal_name: '손은지', birth_date: '1987-08-05', bank_name: '국민은행', account_number: '612345-08-901234', account_holder: '손은지', is_business_registered: false, shipping_address: '경기도 부천시 중동 890-2', usage_rights_month: 3, usage_rights_price: 195000, auto_dm_month: null, auto_dm_price: null },
    // 은채와보리 (여, 1995)
    { email: 'mock_eunchaepet@mock.creadypick.com', legal_name: '정은채', birth_date: '1995-04-21', bank_name: '토스뱅크', account_number: '1000-5678-9012', account_holder: '정은채', is_business_registered: false, shipping_address: '서울특별시 성동구 성수동 890-2', usage_rights_month: 6, usage_rights_price: 340000, auto_dm_month: 1, auto_dm_price: 103000 },
    // 재민드라이브 (남, 1994)
    { email: 'mock_jaemindrive@mock.creadypick.com', legal_name: '윤재민', birth_date: '1994-10-14', bank_name: '하나은행', account_number: '123-345678-90123', account_holder: '윤재민', is_business_registered: true, creator_business_number: '012-34-11111', shipping_address: '경기도 화성시 동탄동 345-6', usage_rights_month: 6, usage_rights_price: 410000, auto_dm_month: 1, auto_dm_price: 122000 },
    // 준혁투자 (남, 1988)
    { email: 'mock_junhyukinvest@mock.creadypick.com', legal_name: '강준혁', birth_date: '1988-01-07', bank_name: '신한은행', account_number: '110-567-890123', account_holder: '강준혁', is_business_registered: true, creator_business_number: '123-45-22222', shipping_address: '서울특별시 강남구 역삼동 123-4', usage_rights_month: 12, usage_rights_price: 600000, auto_dm_month: 1, auto_dm_price: 175000 },
    // 준호캠핑 (남, 1990)
    { email: 'mock_junhocamping@mock.creadypick.com', legal_name: '조준호', birth_date: '1990-06-26', bank_name: '농협은행', account_number: '302-2345-6789-01', account_holder: '조준호', is_business_registered: false, shipping_address: '경기도 용인시 기흥구 중동 567-8', usage_rights_month: 6, usage_rights_price: 380000, auto_dm_month: null, auto_dm_price: null },
    // 지우트래블러 (남, 1995)
    { email: 'mock_jiwootraveler@mock.creadypick.com', legal_name: '이지우', birth_date: '1995-09-11', bank_name: '우리은행', account_number: '1002-890-234567', account_holder: '이지우', is_business_registered: false, shipping_address: '서울특별시 마포구 합정동 567-8', usage_rights_month: 6, usage_rights_price: 480000, auto_dm_month: 1, auto_dm_price: 142000 },
    // 지윤재테크 (여, 1996)
    { email: 'mock_jiyunmoney@mock.creadypick.com', legal_name: '한지윤', birth_date: '1996-11-30', bank_name: '카카오뱅크', account_number: '3333-12-9012340', account_holder: '한지윤', is_business_registered: true, creator_business_number: '234-56-33333', shipping_address: '서울특별시 성동구 성수동 234-5', usage_rights_month: 12, usage_rights_price: 750000, auto_dm_month: 1, auto_dm_price: 218000 },
    // 지현더마 (여, 1993)
    { email: 'mock_jihyunderm@mock.creadypick.com', legal_name: '나지현', birth_date: '1993-03-24', bank_name: '신한은행', account_number: '110-678-901234', account_holder: '나지현', is_business_registered: true, creator_business_number: '345-67-44444', shipping_address: '서울특별시 강남구 역삼동 789-1', usage_rights_month: 12, usage_rights_price: 540000, auto_dm_month: 1, auto_dm_price: 160000 },
    // 지호라멘투어 (남, 1996)
    { email: 'mock_jihoramen@mock.creadypick.com', legal_name: '유지호', birth_date: '1996-07-19', bank_name: '국민은행', account_number: '612345-09-012345', account_holder: '유지호', is_business_registered: false, shipping_address: '서울특별시 용산구 이태원동 890-2', usage_rights_month: 3, usage_rights_price: 175000, auto_dm_month: null, auto_dm_price: null },
    // 지훈게이밍 (남, 1994)
    { email: 'mock_jihoongame@mock.creadypick.com', legal_name: '박지훈', birth_date: '1994-02-08', bank_name: '하나은행', account_number: '123-456789-01234', account_holder: '박지훈', is_business_registered: true, creator_business_number: '456-78-55555', shipping_address: '서울특별시 마포구 합정동 345-6', usage_rights_month: 6, usage_rights_price: 555000, auto_dm_month: 1, auto_dm_price: 163000 },
    // 채원홈 (여, 1995)
    { email: 'mock_chaewonhome@mock.creadypick.com', legal_name: '송채원', birth_date: '1995-12-08', bank_name: '카카오뱅크', account_number: '3333-01-0123450', account_holder: '송채원', is_business_registered: false, shipping_address: '경기도 성남시 분당구 정자동 456-7', usage_rights_month: 3, usage_rights_price: 225000, auto_dm_month: null, auto_dm_price: null },
    // 태민수의사 (남, 1990)
    { email: 'mock_taeminvet@mock.creadypick.com', legal_name: '김태민', birth_date: '1990-05-17', bank_name: '신한은행', account_number: '110-789-012345', account_holder: '김태민', is_business_registered: true, creator_business_number: '567-89-66666', shipping_address: '서울특별시 노원구 중계동 890-2', usage_rights_month: 12, usage_rights_price: 650000, auto_dm_month: 1, auto_dm_price: 190000 },
    // 태양아빠 (남, 1988)
    { email: 'mock_taeyangdad@mock.creadypick.com', legal_name: '최태양', birth_date: '1988-09-01', bank_name: '우리은행', account_number: '1002-901-345678', account_holder: '최태양', is_business_registered: false, shipping_address: '경기도 고양시 일산동구 백석동 890-1', usage_rights_month: 3, usage_rights_price: 188000, auto_dm_month: null, auto_dm_price: null },
    // 태영스트릿 (남, 1997)
    { email: 'mock_taeyoungstreet@mock.creadypick.com', legal_name: '이태영', birth_date: '1997-01-14', bank_name: '토스뱅크', account_number: '1000-6789-0123', account_holder: '이태영', is_business_registered: true, creator_business_number: '678-90-77777', shipping_address: '서울특별시 은평구 응암동 567-8', usage_rights_month: 6, usage_rights_price: 505000, auto_dm_month: 1, auto_dm_price: 148000 },
    // 하늘웨딩 (여, 1992)
    { email: 'mock_haneulwedding@mock.creadypick.com', legal_name: '민하늘', birth_date: '1992-06-20', bank_name: '국민은행', account_number: '612345-10-123456', account_holder: '민하늘', is_business_registered: true, creator_business_number: '789-01-88888', shipping_address: '서울특별시 서대문구 연희동 345-6', usage_rights_month: 6, usage_rights_price: 370000, auto_dm_month: 1, auto_dm_price: 112000 },
    // 하영트립 (여, 1995)
    { email: 'mock_hayoungtrip@mock.creadypick.com', legal_name: '전하영', birth_date: '1995-08-13', bank_name: '신한은행', account_number: '110-890-123456', account_holder: '전하영', is_business_registered: false, shipping_address: '서울특별시 용산구 이태원동 123-4', usage_rights_month: 6, usage_rights_price: 320000, auto_dm_month: null, auto_dm_price: null },
    // 하율웨딩준비 (여, 1998)
    { email: 'mock_yulaweddingprep@mock.creadypick.com', legal_name: '장하율', birth_date: '1998-04-05', bank_name: '카카오뱅크', account_number: '3333-02-1234560', account_holder: '장하율', is_business_registered: false, shipping_address: '경기도 수원시 영통구 영통동 123-4', usage_rights_month: 3, usage_rights_price: 118000, auto_dm_month: null, auto_dm_price: null },
    // 하율임산부일기 (여, 1997)
    { email: 'mock_hayulpregmom@mock.creadypick.com', legal_name: '오하율', birth_date: '1997-10-22', bank_name: '국민은행', account_number: '612345-11-234567', account_holder: '오하율', is_business_registered: false, shipping_address: '서울특별시 마포구 합정동 678-9', usage_rights_month: 3, usage_rights_price: 108000, auto_dm_month: null, auto_dm_price: null },
    // 하은캘리 (여, 1996)
    { email: 'mock_haeuncalligraphy@mock.creadypick.com', legal_name: '윤하은', birth_date: '1996-07-09', bank_name: '토스뱅크', account_number: '1000-7890-1234', account_holder: '윤하은', is_business_registered: false, shipping_address: '서울특별시 성동구 성수동 567-8', usage_rights_month: 3, usage_rights_price: 145000, auto_dm_month: null, auto_dm_price: null },
    // 하음레트로 (여, 1999)
    { email: 'mock_haeumretro@mock.creadypick.com', legal_name: '배하음', birth_date: '1999-03-17', bank_name: '카카오뱅크', account_number: '3333-03-2345670', account_holder: '배하음', is_business_registered: false, shipping_address: '서울특별시 노원구 중계동 123-4', usage_rights_month: 3, usage_rights_price: 163000, auto_dm_month: null, auto_dm_price: null },
    // 하진공방 (여, 1993)
    { email: 'mock_hajincraft@mock.creadypick.com', legal_name: '서하진', birth_date: '1993-11-04', bank_name: '신한은행', account_number: '110-012-345678', account_holder: '서하진', is_business_registered: true, creator_business_number: '890-12-99999', shipping_address: '경기도 고양시 일산동구 백석동 123-4', usage_rights_month: 3, usage_rights_price: 135000, auto_dm_month: null, auto_dm_price: null },
    // 해원가든 (여, 1989)
    { email: 'mock_haewongarden@mock.creadypick.com', legal_name: '김해원', birth_date: '1989-08-28', bank_name: '국민은행', account_number: '612345-12-345678', account_holder: '김해원', is_business_registered: false, shipping_address: '경기도 화성시 동탄동 678-9', usage_rights_month: 3, usage_rights_price: 155000, auto_dm_month: null, auto_dm_price: null },
    // 현우포토 (남, 1993)
    { email: 'mock_hyunwoophoto@mock.creadypick.com', legal_name: '임현우', birth_date: '1993-05-06', bank_name: '하나은행', account_number: '123-567890-12345', account_holder: '임현우', is_business_registered: true, creator_business_number: '901-23-11111', shipping_address: '서울특별시 성동구 성수동 345-6', usage_rights_month: 6, usage_rights_price: 400000, auto_dm_month: 1, auto_dm_price: 118000 },
    // 호진셰프 (남, 1988)
    { email: 'mock_hojinchef@mock.creadypick.com', legal_name: '신호진', birth_date: '1988-02-11', bank_name: '신한은행', account_number: '110-123-456789', account_holder: '신호진', is_business_registered: true, creator_business_number: '012-34-22222', shipping_address: '서울특별시 강남구 역삼동 456-7', usage_rights_month: 6, usage_rights_price: 470000, auto_dm_month: 1, auto_dm_price: 138000 },
]

async function main() {
    console.log(`🚀 추가 프로필 필드 업데이트 중 (${EXTRA_DATA.length}개)...\n`)
    let success = 0
    let failed = 0

    for (const p of EXTRA_DATA) {
        const update = {
            legal_name: p.legal_name,
            birth_date: p.birth_date,
            bank_name: p.bank_name,
            account_number: p.account_number,
            account_holder: p.account_holder,
            is_business_registered: p.is_business_registered,
            shipping_address: p.shipping_address,
            usage_rights_month: p.usage_rights_month,
            usage_rights_price: p.usage_rights_price,
            auto_dm_month: p.auto_dm_month,
            auto_dm_price: p.auto_dm_price,
        }
        if (p.creator_business_number) update.creator_business_number = p.creator_business_number

        const { error } = await supabase
            .from('profiles')
            .update(update)
            .eq('email', p.email)

        if (error) {
            console.error(`❌ ${p.email}: ${error.message}`)
            failed++
        } else {
            console.log(`✅ ${p.legal_name} (${p.email.split('@')[0]})`)
            success++
        }
    }

    console.log(`\n🎉 완료! 성공: ${success}개, 실패: ${failed}개`)
}

main().catch(console.error)
