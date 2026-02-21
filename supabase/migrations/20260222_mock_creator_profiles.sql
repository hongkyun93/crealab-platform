-- ============================================================
-- Mock Creator Profile Data Fill
-- 모든 mock 크리에이터 프로필을 사실적인 한국 인플루언서 데이터로 채웁니다.
-- ============================================================

-- 가영카페로그 (카페/음료 여성)
UPDATE public.profiles SET
  description = '전국 카페를 직접 발로 뛰며 기록하는 카페 탐방 크리에이터 🍵 주 2회 신규 카페 리뷰 업로드 중. 감성 카페 인테리어부터 시그니처 음료까지 꼼꼼하게 기록합니다.',
  instagram_handle = '@gayoung.cafelog',
  followers_count = 38400,
  tier = 'Micro',
  tags = ARRAY['카페', '음료', '디저트', '서울', '카페투어'],
  primary_region = '서울',
  phone = '010-2341-7865',
  website = 'https://blog.naver.com/gayoungcafe',
  price_video = 350000,
  price_feed = 180000,
  price_story = 80000
WHERE email = 'mock_gayoungcafe@mock.creadypick.com';

-- 가은애플 (애플/테크 여성)
UPDATE public.profiles SET
  description = '애플 생태계 완전 정복 중 🍎 MacBook, iPad, iPhone 실사용 리뷰와 생산성 팁을 공유합니다. 테크가 어렵지 않도록 쉽게 풀어드려요.',
  instagram_handle = '@gaeun.apple',
  followers_count = 52100,
  tier = 'Micro',
  tags = ARRAY['애플', '테크', '아이패드', '생산성', 'IT'],
  primary_region = '경기',
  phone = '010-3892-4561',
  website = 'https://www.youtube.com/@gaeun_apple',
  price_video = 480000,
  price_feed = 220000,
  price_story = 100000
WHERE email = 'mock_gaeunapple@mock.creadypick.com';

-- 나라몬테소리 (몬테소리 교육 여성)
UPDATE public.profiles SET
  description = '몬테소리 교육 연구소 출신 육아 크리에이터 👶 0-6세 아이의 자연스러운 발달을 돕는 몬테소리 놀이법과 환경 세팅을 소개합니다.',
  instagram_handle = '@nara_montessori',
  followers_count = 29700,
  tier = 'Micro',
  tags = ARRAY['몬테소리', '육아', '영유아', '교육', '놀이'],
  primary_region = '서울',
  phone = '010-5634-2109',
  website = 'https://blog.naver.com/naramontessori',
  price_video = 280000,
  price_feed = 150000,
  price_story = 70000
WHERE email = 'mock_naramontessori@mock.creadypick.com';

-- 나리영어 (영어 강사 여성)
UPDATE public.profiles SET
  description = '영어 원서 읽기로 영어 정복한 영어 강사 📚 성인 직장인 영어 공부법, 원서 추천, 회화 표현을 매일 업로드. 구독자 합격 후기 댓글 보러 오세요!',
  instagram_handle = '@nari.english_',
  followers_count = 67300,
  tier = 'Micro',
  tags = ARRAY['영어', '영어공부', '회화', '원서', '어학'],
  primary_region = '서울',
  phone = '010-8821-3344',
  website = 'https://www.youtube.com/@narienglish',
  price_video = 550000,
  price_feed = 250000,
  price_story = 120000
WHERE email = 'mock_narienglish@mock.creadypick.com';

-- 나연이와꾸미 (반려견 여성)
UPDATE public.profiles SET
  description = '포메라니안 꾸미와 함께하는 일상 🐾 반려견 용품 리뷰, 강아지 건강 정보, 함께하는 산책 코스를 공유합니다. 꾸미 팬 환영!',
  instagram_handle = '@nayeon_kkumi',
  followers_count = 44800,
  tier = 'Micro',
  tags = ARRAY['반려견', '포메라니안', '강아지', '펫', '동물'],
  primary_region = '경기',
  phone = '010-7712-9983',
  price_video = 380000,
  price_feed = 190000,
  price_story = 90000
WHERE email = 'mock_nayeonpuppy@mock.creadypick.com';

-- 나윤호캉스 (럭셔리 여행 여성)
UPDATE public.profiles SET
  description = '매달 한 번, 프리미엄 호텔과 리조트를 직접 경험합니다 ✨ 호캉스 맛집, 스파 리뷰, 여행 팁을 솔직하게 기록 중. 럭셔리하게 쉬는 법을 알려드릴게요.',
  instagram_handle = '@nayun_hocance',
  followers_count = 83600,
  tier = 'Micro',
  tags = ARRAY['호캉스', '여행', '호텔', '럭셔리', '리조트'],
  primary_region = '서울',
  phone = '010-2288-7751',
  website = 'https://www.instagram.com/nayun_hocance',
  price_video = 720000,
  price_feed = 350000,
  price_story = 160000
WHERE email = 'mock_nayunluxurytrip@mock.creadypick.com';

-- 다인가젯 (가젯/테크 남성)
UPDATE public.profiles SET
  description = '최신 가젯을 가장 먼저 언박싱하고 심층 리뷰합니다 📱 카메라, 스마트워치, 무선이어폰 등 다양한 전자기기의 진짜 사용기를 전합니다.',
  instagram_handle = '@dain_gadget',
  followers_count = 71200,
  tier = 'Micro',
  tags = ARRAY['가젯', '언박싱', '리뷰', '전자기기', '테크'],
  primary_region = '서울',
  phone = '010-4455-8812',
  website = 'https://www.youtube.com/@daingadget',
  price_video = 620000,
  price_feed = 290000,
  price_story = 130000
WHERE email = 'mock_daingadget@mock.creadypick.com';

-- 다현핏 (피트니스 여성)
UPDATE public.profiles SET
  description = '직장인도 할 수 있는 현실 운동 루틴 💪 퇴근 후 30분 홈트부터 PT 없이 혼자 몸 만드는 방법까지. 운동이 귀찮은 당신을 위한 채널.',
  instagram_handle = '@dahyun.fit_',
  followers_count = 96400,
  tier = 'Micro',
  tags = ARRAY['피트니스', '헬스', '다이어트', '홈트', '운동'],
  primary_region = '서울',
  phone = '010-9912-3367',
  price_video = 830000,
  price_feed = 400000,
  price_story = 180000
WHERE email = 'mock_dahyunfit@mock.creadypick.com';

-- 도경플랜테리어 (플랜테리어 여성)
UPDATE public.profiles SET
  description = '식물 인테리어로 집을 숲으로 만드는 중 🌿 공기정화 식물 추천, 화분 배치법, 식물 케어 방법을 쉽게 알려드립니다. 초보 식집사 환영!',
  instagram_handle = '@dokyeong.planterior',
  followers_count = 41300,
  tier = 'Micro',
  tags = ARRAY['플랜테리어', '식물', '인테리어', '홈데코', '식집사'],
  primary_region = '경기',
  phone = '010-6634-2281',
  price_video = 360000,
  price_feed = 180000,
  price_story = 85000
WHERE email = 'mock_dogyeongplant@mock.creadypick.com';

-- 도하피아노 (피아노/음악 여성)
UPDATE public.profiles SET
  description = '클래식부터 팝까지, 피아노로 모든 걸 연주하는 피아니스트 🎹 악보 분석, 연습 루틴, 피아노 추천까지. 음악을 사랑하는 모두를 위한 공간.',
  instagram_handle = '@doha.piano',
  followers_count = 34500,
  tier = 'Micro',
  tags = ARRAY['피아노', '클래식', '음악', '악기', '연주'],
  primary_region = '서울',
  phone = '010-3345-7823',
  website = 'https://www.youtube.com/@dohapiano',
  price_video = 310000,
  price_feed = 160000,
  price_story = 75000
WHERE email = 'mock_dohapiano@mock.creadypick.com';

-- 도현테크 (개발/IT 남성)
UPDATE public.profiles SET
  description = '현직 개발자가 알려주는 실무 IT 지식 💻 프로그래밍 튜토리얼, 개발자 커리어 팁, 최신 테크 트렌드를 쉽게 설명합니다.',
  instagram_handle = '@dohyun.tech',
  followers_count = 58900,
  tier = 'Micro',
  tags = ARRAY['개발', '프로그래밍', 'IT', '코딩', '테크'],
  primary_region = '서울',
  phone = '010-7823-4456',
  website = 'https://github.com/dohyuntech',
  price_video = 520000,
  price_feed = 240000,
  price_story = 110000
WHERE email = 'mock_dohyuntech@mock.creadypick.com';

-- 동건머슬 (보디빌딩 남성)
UPDATE public.profiles SET
  description = '자연인 보디빌더의 현실적인 벌크업/컷팅 일지 💪 보충제 솔직 리뷰, 식단 관리, 운동 영상까지. 약 없이 만드는 몸의 증거입니다.',
  instagram_handle = '@donggun_muscle',
  followers_count = 112000,
  tier = 'Macro',
  tags = ARRAY['보디빌딩', '헬스', '운동', '다이어트', '근성장'],
  primary_region = '인천',
  phone = '010-5581-9923',
  price_video = 980000,
  price_feed = 450000,
  price_story = 200000
WHERE email = 'mock_donggunmuscle@mock.creadypick.com';

-- 라온신혼일기 (신혼 여성)
UPDATE public.profiles SET
  description = '신혼 1년차 부부의 솔직한 일상 🏠 신혼집 꾸미기, 두 사람 요리, 금융 재테크까지 함께 성장하는 이야기를 기록합니다.',
  instagram_handle = '@raon.newlywed',
  followers_count = 27800,
  tier = 'Micro',
  tags = ARRAY['신혼', '결혼', '신혼집', '부부', '홈'],
  primary_region = '경기',
  phone = '010-2234-5567',
  price_video = 260000,
  price_feed = 140000,
  price_story = 65000
WHERE email = 'mock_raonnewlywed@mock.creadypick.com';

-- 민규이스포츠 (이스포츠 남성)
UPDATE public.profiles SET
  description = '현직 이스포츠 선수 출신 게임 크리에이터 🎮 롤, 발로란트, 피파 공략 영상. 하이라이트 클립부터 프로게이머 훈련법까지 공개합니다.',
  instagram_handle = '@mingyue_sports',
  followers_count = 143000,
  tier = 'Macro',
  tags = ARRAY['이스포츠', '게임', '롤', '스트리머', '게이밍'],
  primary_region = '서울',
  phone = '010-8823-1145',
  website = 'https://www.twitch.tv/mingyuesports',
  price_video = 1250000,
  price_feed = 580000,
  price_story = 250000
WHERE email = 'mock_mingyuesport@mock.creadypick.com';

-- 민서맘 (육아 여성)
UPDATE public.profiles SET
  description = '4살 민서 엄마의 솔직한 육아 일기 👶 월령별 발달 정보, 아이 간식 레시피, 장난감 리뷰까지. 같이 크는 엄마입니다.',
  instagram_handle = '@minseo.mom_',
  followers_count = 33200,
  tier = 'Micro',
  tags = ARRAY['육아', '맘', '유아', '아이', '엄마'],
  primary_region = '경기',
  phone = '010-4423-8819',
  price_video = 300000,
  price_feed = 160000,
  price_story = 75000
WHERE email = 'mock_minseobaby@mock.creadypick.com';

-- 민지잇츠 (먹방/음식 여성)
UPDATE public.profiles SET
  description = '서울 맛집을 직접 다 먹어보는 푸드 크리에이터 🍜 핫플 맛집, 숨은 로컬 맛집, 배달 음식 솔직 리뷰. 먹는 게 제일 행복해요!',
  instagram_handle = '@minji.eats',
  followers_count = 76500,
  tier = 'Micro',
  tags = ARRAY['맛집', '먹방', '음식', '서울맛집', '푸드'],
  primary_region = '서울',
  phone = '010-6612-3387',
  price_video = 660000,
  price_feed = 310000,
  price_story = 140000
WHERE email = 'mock_minjieats@mock.creadypick.com';

-- 서아리빙 (홈리빙 여성)
UPDATE public.profiles SET
  description = '32평 아파트를 북유럽 감성으로 꾸민 인테리어 크리에이터 🏡 저렴하게 고급스럽게 꾸미는 법, 홈데코 소품 추천, DIY 인테리어 튜토리얼.',
  instagram_handle = '@seoa.living',
  followers_count = 62100,
  tier = 'Micro',
  tags = ARRAY['인테리어', '홈리빙', '홈데코', '라이프스타일', '집꾸미기'],
  primary_region = '서울',
  phone = '010-3312-9845',
  website = 'https://www.youtube.com/@seoaliving',
  price_video = 540000,
  price_feed = 260000,
  price_story = 120000
WHERE email = 'mock_seoaliving@mock.creadypick.com';

-- 서영공부법 (공부법/자기계발 여성)
UPDATE public.profiles SET
  description = '서울대 출신 스터디 플래너가 알려주는 효율적인 공부법 📖 시험 준비, 집중력 향상 루틴, 공부할 때 쓰는 앱/도구 추천.',
  instagram_handle = '@seoyoung.study',
  followers_count = 89300,
  tier = 'Micro',
  tags = ARRAY['공부', '자기계발', '시험', '학습', '스터디'],
  primary_region = '서울',
  phone = '010-9934-2267',
  website = 'https://blog.naver.com/seoyoungstudy',
  price_video = 770000,
  price_feed = 360000,
  price_story = 165000
WHERE email = 'mock_seoyoungstudy@mock.creadypick.com';

-- 서율솔로여행 (솔로 여행 여성)
UPDATE public.profiles SET
  description = '여자 혼자도 안전하게! 솔로 여행 가이드 ✈️ 국내외 혼행 코스, 혼밥 맛집, 1인 여행 절약 팁. 용기 내서 떠나보세요!',
  instagram_handle = '@seoyul.traveler',
  followers_count = 54700,
  tier = 'Micro',
  tags = ARRAY['혼행', '여행', '솔로여행', '국내여행', '해외여행'],
  primary_region = '서울',
  phone = '010-7723-8841',
  price_video = 480000,
  price_feed = 230000,
  price_story = 105000
WHERE email = 'mock_seoyulsolo@mock.creadypick.com';

-- 서진키친 (홈쿡 여성)
UPDATE public.profiles SET
  description = '마트에서 파는 재료로 레스토랑 퀄리티 요리 만들기 🍳 한식, 양식, 일식 가리지 않고 요리합니다. 레시피 영상 매주 3회 업로드.',
  instagram_handle = '@seojin.kitchen',
  followers_count = 47200,
  tier = 'Micro',
  tags = ARRAY['요리', '홈쿡', '레시피', '음식', '쿠킹'],
  primary_region = '경기',
  phone = '010-5534-7712',
  price_video = 410000,
  price_feed = 200000,
  price_story = 92000
WHERE email = 'mock_seojinkitchen@mock.creadypick.com';

-- 성민개발 (개발자 남성)
UPDATE public.profiles SET
  description = '스타트업 시니어 개발자의 실무 코딩 채널 💡 React, Next.js, TypeScript 튜토리얼과 개발자 취업/이직 인사이트를 공유합니다.',
  instagram_handle = '@sungmin.dev',
  followers_count = 48600,
  tier = 'Micro',
  tags = ARRAY['개발', '코딩', 'React', '개발자', '프로그래밍'],
  primary_region = '서울',
  phone = '010-4481-2295',
  website = 'https://github.com/sungmindev',
  price_video = 430000,
  price_feed = 210000,
  price_story = 96000
WHERE email = 'mock_sungmindev@mock.creadypick.com';

-- 소담베이킹 (베이킹 여성)
UPDATE public.profiles SET
  description = '제과제빵기능사 보유, 홈베이킹 전문 크리에이터 🧁 케이크, 쿠키, 마카롱 레시피를 초보도 따라할 수 있게 알려드립니다.',
  instagram_handle = '@sodam.baking',
  followers_count = 36900,
  tier = 'Micro',
  tags = ARRAY['베이킹', '홈베이킹', '케이크', '쿠키', '제과'],
  primary_region = '서울',
  phone = '010-6651-3478',
  price_video = 330000,
  price_feed = 170000,
  price_story = 78000
WHERE email = 'mock_sodambaking@mock.creadypick.com';

-- 소라갤러리 (문화/예술 여성)
UPDATE public.profiles SET
  description = '미술관과 갤러리를 일상처럼 방문하는 아트 크리에이터 🎨 전시회 리뷰, 작가 인터뷰, 문화생활 추천. 예술이 어렵지 않아요.',
  instagram_handle = '@sora.gallery',
  followers_count = 22400,
  tier = 'Nano',
  tags = ARRAY['예술', '전시', '갤러리', '문화', '미술'],
  primary_region = '서울',
  phone = '010-8834-5562',
  price_video = 210000,
  price_feed = 115000,
  price_story = 55000
WHERE email = 'mock_soraculture@mock.creadypick.com';

-- 수진비건 (비건 여성)
UPDATE public.profiles SET
  description = '3년차 비건의 현실적인 비건 라이프 🌱 비건 레시피, 비건 제품 리뷰, 비건 식당 추천. 채식이 맛없다는 편견을 깨드립니다.',
  instagram_handle = '@sujin.vegan',
  followers_count = 31600,
  tier = 'Micro',
  tags = ARRAY['비건', '채식', '비건레시피', '건강', '환경'],
  primary_region = '서울',
  phone = '010-2267-9948',
  price_video = 290000,
  price_feed = 155000,
  price_story = 72000
WHERE email = 'mock_sujinvegan@mock.creadypick.com';

-- 수현크립토 (암호화폐 남성)
UPDATE public.profiles SET
  description = '비트코인 2017년부터 버텨온 코인 고인물 🪙 블록체인 기술 분석, 시장 동향, 투자 전략을 데이터 기반으로 설명합니다. 투자는 본인 판단!',
  instagram_handle = '@suhyun.crypto',
  followers_count = 67800,
  tier = 'Micro',
  tags = ARRAY['암호화폐', '비트코인', '코인', '블록체인', '투자'],
  primary_region = '서울',
  phone = '010-7745-1123',
  website = 'https://www.youtube.com/@suhyuncrypto',
  price_video = 590000,
  price_feed = 275000,
  price_story = 125000
WHERE email = 'mock_suhyuncrypto@mock.creadypick.com';

-- 시우네고양이 (고양이 남성)
UPDATE public.profiles SET
  description = '코리안숏헤어 3마리와 사는 집사의 일상 😺 고양이 용품 솔직 리뷰, 건강 관리 팁, 다묘 가정 생활 정보 공유.',
  instagram_handle = '@siwoo.cats',
  followers_count = 39200,
  tier = 'Micro',
  tags = ARRAY['고양이', '집사', '반려묘', '펫', '동물'],
  primary_region = '서울',
  phone = '010-9923-6678',
  price_video = 350000,
  price_feed = 180000,
  price_story = 82000
WHERE email = 'mock_siwoocats@mock.creadypick.com';

-- 시은요가 (요가/필라테스 여성)
UPDATE public.profiles SET
  description = '요가 강사 자격증 보유, 매일 아침 요가 루틴 공유 🧘‍♀️ 초보자를 위한 기본 자세 교정부터 중급 플로우까지. 몸과 마음을 함께 정돈해요.',
  instagram_handle = '@sieun.yoga',
  followers_count = 58300,
  tier = 'Micro',
  tags = ARRAY['요가', '필라테스', '운동', '명상', '건강'],
  primary_region = '서울',
  phone = '010-4412-7736',
  price_video = 510000,
  price_feed = 245000,
  price_story = 112000
WHERE email = 'mock_sieunyoga@mock.creadypick.com';

-- 쏘리버드 (반려조 여성)
UPDATE public.profiles SET
  description = '앵무새 쏘리와 함께하는 버드라이프 🦜 앵무새 키우기, 먹이 추천, 훈련법, 조류 건강 정보. 새를 키우고 싶다면 여기서 시작하세요.',
  instagram_handle = '@sori_bird',
  followers_count = 18700,
  tier = 'Nano',
  tags = ARRAY['앵무새', '반려조', '새', '펫', '동물'],
  primary_region = '경기',
  phone = '010-5523-8841',
  price_video = 180000,
  price_feed = 100000,
  price_story = 48000
WHERE email = 'mock_soribirdlife@mock.creadypick.com';

-- 아린펫푸드 (펫푸드 여성)
UPDATE public.profiles SET
  description = '수의영양학 전공, 반려동물 영양사의 펫푸드 채널 🐶 강아지·고양이 수제간식, 자연식 레시피, 사료 성분 분석. 우리 아이 건강하게 먹이고 싶다면!',
  instagram_handle = '@arin.petfood',
  followers_count = 43500,
  tier = 'Micro',
  tags = ARRAY['펫푸드', '강아지', '고양이', '수제간식', '반려동물'],
  primary_region = '서울',
  phone = '010-6634-2219',
  price_video = 390000,
  price_feed = 195000,
  price_story = 88000
WHERE email = 'mock_arinpetfood@mock.creadypick.com';

-- 예나쌍둥이 (쌍둥이맘 여성)
UPDATE public.profiles SET
  description = '쌍둥이 엄마의 두 배로 웃기고 두 배로 힘든 육아일기 👧👧 쌍둥이 용품 추천, 쌍둥이 맘 커뮤니티, 이란성 쌍둥이 발달 기록.',
  instagram_handle = '@yena.twins',
  followers_count = 28100,
  tier = 'Micro',
  tags = ARRAY['쌍둥이', '육아', '맘', '아이', '엄마'],
  primary_region = '경기',
  phone = '010-3345-8867',
  price_video = 265000,
  price_feed = 145000,
  price_story = 67000
WHERE email = 'mock_yenatwins@mock.creadypick.com';

-- 예린푸드 (음식 여성)
UPDATE public.profiles SET
  description = '요리 연구가 지망생의 실험 요리 채널 🍽️ 신기한 재료 조합, 세계 음식 재현, 편의점 요리 업그레이드. 먹는 것에 진심입니다.',
  instagram_handle = '@yerin.food_',
  followers_count = 35800,
  tier = 'Micro',
  tags = ARRAY['요리', '음식', '레시피', '맛집', '푸드'],
  primary_region = '서울',
  phone = '010-8812-4453',
  price_video = 320000,
  price_feed = 165000,
  price_story = 76000
WHERE email = 'mock_yerinfood@mock.creadypick.com';

-- 예은워킹맘 (워킹맘 여성)
UPDATE public.profiles SET
  description = '대기업 마케터 + 7살 아이 엄마의 현실 워킹맘 이야기 💼 육아와 일 병행 노하우, 시간 관리, 워킹맘 공감 콘텐츠.',
  instagram_handle = '@yeeun.workingmom',
  followers_count = 41700,
  tier = 'Micro',
  tags = ARRAY['워킹맘', '육아', '직장인', '자기계발', '맘'],
  primary_region = '서울',
  phone = '010-2256-9934',
  price_video = 375000,
  price_feed = 190000,
  price_story = 87000
WHERE email = 'mock_yeeunmom@mock.creadypick.com';

-- 우성구르메 (고메 음식 남성)
UPDATE public.profiles SET
  description = '파인다이닝부터 동네 노포까지, 미식을 탐구하는 구르메 크리에이터 🍷 셰프 인터뷰, 코스 요리 리뷰, 와인 페어링 추천.',
  instagram_handle = '@woosung.gourmet',
  followers_count = 55200,
  tier = 'Micro',
  tags = ARRAY['파인다이닝', '미식', '레스토랑', '와인', '맛집'],
  primary_region = '서울',
  phone = '010-9978-3312',
  price_video = 490000,
  price_feed = 235000,
  price_story = 108000
WHERE email = 'mock_wsgourmet@mock.creadypick.com';

-- 우재오디오 (오디오 남성)
UPDATE public.profiles SET
  description = '하이파이 오디오 마니아의 기어 리뷰 채널 🎧 이어폰, 헤드폰, DAC/AMP, 스피커 심층 리뷰. 음악을 제대로 듣고 싶은 분들 오세요.',
  instagram_handle = '@woojae.audio',
  followers_count = 29800,
  tier = 'Micro',
  tags = ARRAY['오디오', '이어폰', '헤드폰', '음향', 'DAC'],
  primary_region = '인천',
  phone = '010-4423-7756',
  website = 'https://www.youtube.com/@woojaeaudio',
  price_video = 280000,
  price_feed = 150000,
  price_story = 70000
WHERE email = 'mock_woojaeaudio@mock.creadypick.com';

-- 유진제주 (제주 여행 여성)
UPDATE public.profiles SET
  description = '제주에 살며 제주를 기록하는 제주 로컬 크리에이터 🌊 숨은 제주 맛집, 제주 올레길, 현지인만 아는 스팟을 소개합니다.',
  instagram_handle = '@yujin.jeju',
  followers_count = 47900,
  tier = 'Micro',
  tags = ARRAY['제주', '여행', '제주맛집', '제주도', '로컬'],
  primary_region = '제주',
  phone = '010-7789-2234',
  price_video = 430000,
  price_feed = 210000,
  price_story = 96000
WHERE email = 'mock_yujinisland@mock.creadypick.com';

-- 윤아헬스로그 (헬스/건강 여성)
UPDATE public.profiles SET
  description = '영양사 자격증 보유, 건강한 다이어트 정보 제공 🥗 칼로리 계산, 운동 루틴, 건강 식단 구성법을 과학적으로 알려드립니다.',
  instagram_handle = '@yuna.healthlog',
  followers_count = 72100,
  tier = 'Micro',
  tags = ARRAY['헬스', '다이어트', '건강', '영양', '운동'],
  primary_region = '서울',
  phone = '010-5512-8867',
  price_video = 630000,
  price_feed = 295000,
  price_story = 135000
WHERE email = 'mock_yunahealth@mock.creadypick.com';

-- 은별클린 (청소/살림 여성)
UPDATE public.profiles SET
  description = '15분에 집 정리 완료! 현실적인 청소 루틴 공유 🧹 청소 꿀팁, 정리 수납법, 청소 용품 리뷰. 깨끗한 집에서 사는 행복을 알려드릴게요.',
  instagram_handle = '@eunbyul.clean',
  followers_count = 61400,
  tier = 'Micro',
  tags = ARRAY['청소', '살림', '정리정돈', '수납', '클린'],
  primary_region = '경기',
  phone = '010-3345-6612',
  price_video = 540000,
  price_feed = 255000,
  price_story = 118000
WHERE email = 'mock_eunbyulclean@mock.creadypick.com';

-- 은서의서재 (독서 여성)
UPDATE public.profiles SET
  description = '월 10권 독서하는 북튜버의 진솔한 책 리뷰 📚 소설, 자기계발, 경제 등 장르 불문 독서합니다. 책 한 권이 인생을 바꿀 수 있어요.',
  instagram_handle = '@eunseo.books',
  followers_count = 24600,
  tier = 'Nano',
  tags = ARRAY['독서', '책', '북스타그램', '자기계발', '서재'],
  primary_region = '서울',
  phone = '010-8823-4491',
  price_video = 235000,
  price_feed = 128000,
  price_story = 60000
WHERE email = 'mock_eunseobook@mock.creadypick.com';

-- 은지홈쿡 (홈쿡 여성)
UPDATE public.profiles SET
  description = '결혼 8년차 주부의 가족을 위한 집밥 레시피 🥘 아이도 좋아하는 건강 반찬, 간단한 한 그릇 요리, 명절 음식 레시피 정리.',
  instagram_handle = '@eunji.homecook',
  followers_count = 38700,
  tier = 'Micro',
  tags = ARRAY['집밥', '요리', '반찬', '한식', '가정식'],
  primary_region = '경기',
  phone = '010-6678-3312',
  price_video = 345000,
  price_feed = 178000,
  price_story = 82000
WHERE email = 'mock_eunjihomecook@mock.creadypick.com';

-- 은채와보리 (반려견 여성)
UPDATE public.profiles SET
  description = '비숑 프리제 보리와 함께하는 행복한 일상 🐩 강아지 훈련법, 미용 팁, 반려견 동반 여행 코스. 보리의 성장 일기를 함께 봐주세요.',
  instagram_handle = '@eunchae.bori',
  followers_count = 52300,
  tier = 'Micro',
  tags = ARRAY['비숑', '강아지', '반려견', '펫', '동물'],
  primary_region = '서울',
  phone = '010-4456-9923',
  price_video = 465000,
  price_feed = 225000,
  price_story = 103000
WHERE email = 'mock_eunchaepet@mock.creadypick.com';

-- 재민드라이브 (자동차 남성)
UPDATE public.profiles SET
  description = '자동차를 사랑하는 모터스포츠 마니아 🚗 신차 시승기, 자동차 관리법, 드라이브 코스 추천. 차 살 때 이 채널 꼭 보세요.',
  instagram_handle = '@jaemin.drive',
  followers_count = 63500,
  tier = 'Micro',
  tags = ARRAY['자동차', '드라이브', '신차', '모터스포츠', '카리뷰'],
  primary_region = '경기',
  phone = '010-9923-7745',
  website = 'https://www.youtube.com/@jaemindrive',
  price_video = 560000,
  price_feed = 265000,
  price_story = 122000
WHERE email = 'mock_jaemindrive@mock.creadypick.com';

-- 준혁투자 (투자/주식 남성)
UPDATE public.profiles SET
  description = '10년차 개인투자자의 국내외 주식 분석 채널 📈 가치투자 관점의 기업 분석, ETF 포트폴리오, 경제 뉴스 해설. 장기투자로 함께 성장해요.',
  instagram_handle = '@junhyuk.invest',
  followers_count = 94700,
  tier = 'Micro',
  tags = ARRAY['주식', '투자', '재테크', 'ETF', '경제'],
  primary_region = '서울',
  phone = '010-2234-5561',
  website = 'https://www.youtube.com/@junhyukinvest',
  price_video = 820000,
  price_feed = 385000,
  price_story = 175000
WHERE email = 'mock_junhyukinvest@mock.creadypick.com';

-- 준호캠핑 (캠핑 남성)
UPDATE public.profiles SET
  description = '캠핑 4년차, 전국 캠핑장을 직접 다 가본 캠핑 크리에이터 ⛺ 캠핑 장비 리뷰, 캠핑장 추천, 캠핑 요리 레시피. 캠린이도 쉽게!',
  instagram_handle = '@junho.camping_',
  followers_count = 58600,
  tier = 'Micro',
  tags = ARRAY['캠핑', '글램핑', '아웃도어', '캠핑장', '자연'],
  primary_region = '경기',
  phone = '010-7712-8834',
  price_video = 520000,
  price_feed = 248000,
  price_story = 114000
WHERE email = 'mock_junhocamping@mock.creadypick.com';

-- 지우트래블러 (여행 남성)
UPDATE public.profiles SET
  description = '1년에 10개국, 저예산 해외여행 전문 크리에이터 ✈️ 항공료 절약법, 호텔 vs 호스텔, 현지인처럼 여행하는 팁을 모두 공개합니다.',
  instagram_handle = '@jiwoo.traveler',
  followers_count = 76400,
  tier = 'Micro',
  tags = ARRAY['해외여행', '여행', '배낭여행', '항공', '저예산여행'],
  primary_region = '서울',
  phone = '010-5589-2234',
  price_video = 660000,
  price_feed = 310000,
  price_story = 142000
WHERE email = 'mock_jiwootraveler@mock.creadypick.com';

-- 지윤재테크 (재테크/금융 여성)
UPDATE public.profiles SET
  description = '20대에 1억 모은 재테크 크리에이터 💰 적금, ETF 투자, 절약 노하우, 월급관리 스프레드시트 공유. 재테크는 빠를수록 좋아요.',
  instagram_handle = '@jiyun.money',
  followers_count = 118000,
  tier = 'Macro',
  tags = ARRAY['재테크', '저축', '투자', '주식', '절약'],
  primary_region = '서울',
  phone = '010-3389-7712',
  website = 'https://www.youtube.com/@jiyunmoney',
  price_video = 1020000,
  price_feed = 480000,
  price_story = 218000
WHERE email = 'mock_jiyunmoney@mock.creadypick.com';

-- 지현더마 (피부/더마뷰티 여성)
UPDATE public.profiles SET
  description = '피부과 전문의 추천 더마 뷰티 크리에이터 🧴 성분 분석, 자극없는 스킨케어, 피부 타입별 추천 루틴. 피부 걱정 끝냅시다.',
  instagram_handle = '@jihyun.derm',
  followers_count = 85200,
  tier = 'Micro',
  tags = ARRAY['피부', '스킨케어', '더마', '화장품', '뷰티'],
  primary_region = '서울',
  phone = '010-6634-1198',
  price_video = 740000,
  price_feed = 350000,
  price_story = 160000
WHERE email = 'mock_jihyunderm@mock.creadypick.com';

-- 지호라멘투어 (라멘/음식 남성)
UPDATE public.profiles SET
  description = '일본 유학 3년, 라멘 먹방 전문 크리에이터 🍜 서울 라멘 맛집 탐방, 일본 라멘 성지 투어, 직접 만드는 라멘 레시피.',
  instagram_handle = '@jiho.ramen',
  followers_count = 33900,
  tier = 'Micro',
  tags = ARRAY['라멘', '일본음식', '먹방', '맛집', '음식'],
  primary_region = '서울',
  phone = '010-9978-4412',
  price_video = 305000,
  price_feed = 158000,
  price_story = 73000
WHERE email = 'mock_jihoramen@mock.creadypick.com';

-- 지훈게이밍 (게이밍 남성)
UPDATE public.profiles SET
  description = '스팀 게임 5000시간 돌파, 게임 리뷰어 🎮 RPG, FPS, 인디게임 가리지 않고 모두 플레이. 게임 살 때 이 채널 먼저 보세요.',
  instagram_handle = '@jihoon.gaming',
  followers_count = 87600,
  tier = 'Micro',
  tags = ARRAY['게임', '게이밍', '스팀', '리뷰', '스트리밍'],
  primary_region = '서울',
  phone = '010-4423-6678',
  website = 'https://www.twitch.tv/jihoongaming',
  price_video = 760000,
  price_feed = 358000,
  price_story = 163000
WHERE email = 'mock_jihoongame@mock.creadypick.com';

-- 채원홈 (홈/인테리어 여성)
UPDATE public.profiles SET
  description = '20평 신혼집을 예쁘게 꾸미는 과정 전부 공개 🏠 저예산 인테리어, 이케아 활용법, 홈데코 아이디어. 예쁜 집이 꿈이라면 팔로우!',
  instagram_handle = '@chaewon.home',
  followers_count = 44100,
  tier = 'Micro',
  tags = ARRAY['인테리어', '홈데코', '신혼집', '이케아', '집꾸미기'],
  primary_region = '경기',
  phone = '010-7756-3312',
  price_video = 395000,
  price_feed = 198000,
  price_story = 90000
WHERE email = 'mock_chaewonhome@mock.creadypick.com';

-- 태민수의사 (수의사 남성)
UPDATE public.profiles SET
  description = '현직 수의사가 알려주는 반려동물 건강 정보 🐾 예방접종, 질병 증상, 올바른 영양 섭취. 우리 아이 건강 지키는 진짜 정보를 드립니다.',
  instagram_handle = '@taemin.vet',
  followers_count = 103000,
  tier = 'Macro',
  tags = ARRAY['수의사', '반려동물', '강아지', '고양이', '동물병원'],
  primary_region = '서울',
  phone = '010-3389-8812',
  price_video = 890000,
  price_feed = 420000,
  price_story = 190000
WHERE email = 'mock_taeminvet@mock.creadypick.com';

-- 태양아빠 (육아 아빠 남성)
UPDATE public.profiles SET
  description = '육아 참여 아빠의 진심 육아 일기 👨‍👦 아이와 함께하는 주말, 아빠표 요리, 아이 교육 이야기. 육아는 엄마만의 몫이 아니에요.',
  instagram_handle = '@taeyang_dad',
  followers_count = 36400,
  tier = 'Micro',
  tags = ARRAY['육아', '아빠', '아이', '가족', '유아'],
  primary_region = '경기',
  phone = '010-5512-7789',
  price_video = 330000,
  price_feed = 170000,
  price_story = 78000
WHERE email = 'mock_taeyangdad@mock.creadypick.com';

-- 태영스트릿 (스트릿 패션 남성)
UPDATE public.profiles SET
  description = '홍대·이태원 스트릿 패션 크리에이터 👟 스트릿웨어, 스니커즈 리뷰, 코디 추천. 패션은 자기표현입니다.',
  instagram_handle = '@taeyoung.street',
  followers_count = 79300,
  tier = 'Micro',
  tags = ARRAY['스트릿패션', '패션', '스니커즈', '코디', '스트릿웨어'],
  primary_region = '서울',
  phone = '010-8812-4456',
  price_video = 690000,
  price_feed = 325000,
  price_story = 148000
WHERE email = 'mock_taeyoungstreet@mock.creadypick.com';

-- 하늘웨딩 (웨딩 여성)
UPDATE public.profiles SET
  description = '웨딩 플래너 출신 웨딩 크리에이터 💍 웨딩홀 투어, 드레스 선택법, 예산 절약 웨딩 준비 과정 전부 공개. 결혼 준비 커플 모두 환영!',
  instagram_handle = '@haneul.wedding',
  followers_count = 57800,
  tier = 'Micro',
  tags = ARRAY['웨딩', '결혼준비', '드레스', '웨딩홀', '예식'],
  primary_region = '서울',
  phone = '010-2267-5534',
  price_video = 510000,
  price_feed = 245000,
  price_story = 112000
WHERE email = 'mock_haneulwedding@mock.creadypick.com';

-- 하영트립 (여행 여성)
UPDATE public.profiles SET
  description = '매달 한 도시, 1년 12개국 여행하는 여행 크리에이터 ✈️ 여행 코스 기획, 여행 경비 공개, 혼자 떠나도 안전한 여행법.',
  instagram_handle = '@hayoung.trip',
  followers_count = 49200,
  tier = 'Micro',
  tags = ARRAY['여행', '해외여행', '여행코스', '항공권', '배낭'],
  primary_region = '서울',
  phone = '010-6634-8823',
  price_video = 440000,
  price_feed = 215000,
  price_story = 98000
WHERE email = 'mock_hayoungtrip@mock.creadypick.com';

-- 하율웨딩준비 (웨딩준비 여성)
UPDATE public.profiles SET
  description = '6개월 웨딩 준비 모든 과정 기록 💒 스드메 견적 비교, 청첩장 제작, 신혼여행 준비. 결혼 앞둔 커플에게 꼭 필요한 정보 드립니다.',
  instagram_handle = '@hayul.wedding_prep',
  followers_count = 21300,
  tier = 'Nano',
  tags = ARRAY['웨딩준비', '결혼', '스드메', '신혼', '웨딩'],
  primary_region = '경기',
  phone = '010-5523-7712',
  price_video = 205000,
  price_feed = 112000,
  price_story = 53000
WHERE email = 'mock_yulaweddingprep@mock.creadypick.com';

-- 하율임산부일기 (임산부 여성)
UPDATE public.profiles SET
  description = '임신 7개월차 임산부의 솔직한 임신 일기 🤰 임신 증상, 태교 방법, 출산 준비 목록. 예비맘들의 공감 채널입니다.',
  instagram_handle = '@hayul.pregmom',
  followers_count = 19600,
  tier = 'Nano',
  tags = ARRAY['임산부', '임신', '태교', '예비맘', '출산'],
  primary_region = '서울',
  phone = '010-7745-3312',
  price_video = 190000,
  price_feed = 105000,
  price_story = 50000
WHERE email = 'mock_hayulpregmom@mock.creadypick.com';

-- 하은캘리 (캘리그라피 여성)
UPDATE public.profiles SET
  description = '손글씨로 마음을 전하는 캘리그라피 크리에이터 ✍️ 기초 캘리그라피 강의, 나만의 폰트 만들기, 소품 제작 DIY 튜토리얼.',
  instagram_handle = '@haeun.calli',
  followers_count = 26400,
  tier = 'Nano',
  tags = ARRAY['캘리그라피', '손글씨', '서예', 'DIY', '아트'],
  primary_region = '서울',
  phone = '010-3389-5561',
  price_video = 250000,
  price_feed = 135000,
  price_story = 63000
WHERE email = 'mock_haeuncalligraphy@mock.creadypick.com';

-- 하음레트로 (레트로/빈티지 여성)
UPDATE public.profiles SET
  description = '70-90년대 레트로 감성 수집가 🎞️ 빈티지 패션, 필름 카메라, 레트로 소품 수집기. 오래된 것들의 아름다움을 함께 발견해요.',
  instagram_handle = '@haeum.retro',
  followers_count = 31200,
  tier = 'Micro',
  tags = ARRAY['레트로', '빈티지', '필름카메라', '레트로패션', '수집'],
  primary_region = '서울',
  phone = '010-8834-7723',
  price_video = 285000,
  price_feed = 152000,
  price_story = 71000
WHERE email = 'mock_haeumretro@mock.creadypick.com';

-- 하진공방 (공방/DIY 여성)
UPDATE public.profiles SET
  description = '가죽공예·목공 공방 운영 크리에이터 🔨 직접 만드는 가죽 지갑, 목재 소품, DIY 인테리어 소품. 무언가 만드는 행복을 나눕니다.',
  instagram_handle = '@hajin.craft',
  followers_count = 24800,
  tier = 'Nano',
  tags = ARRAY['공방', 'DIY', '가죽공예', '목공', '핸드메이드'],
  primary_region = '경기',
  phone = '010-4456-1123',
  price_video = 235000,
  price_feed = 128000,
  price_story = 60000
WHERE email = 'mock_hajincraft@mock.creadypick.com';

-- 해원가든 (가든/원예 여성)
UPDATE public.profiles SET
  description = '베란다 텃밭에서 시작한 가드닝 크리에이터 🌸 채소 재배, 허브 키우기, 꽃 가꾸기. 도시에서도 초록 공간을 만들 수 있어요.',
  instagram_handle = '@haewon.garden',
  followers_count = 28900,
  tier = 'Micro',
  tags = ARRAY['가드닝', '원예', '텃밭', '식물', '베란다'],
  primary_region = '경기',
  phone = '010-6623-8845',
  price_video = 270000,
  price_feed = 146000,
  price_story = 68000
WHERE email = 'mock_haewongarden@mock.creadypick.com';

-- 현우포토 (사진/포토그래피 남성)
UPDATE public.profiles SET
  description = '미러리스 카메라로 일상의 순간을 예술로 만드는 사진가 📷 카메라 세팅 튜토리얼, 포토그래피 여행, 사진 보정 Lightroom 강의.',
  instagram_handle = '@hyunwoo.photo',
  followers_count = 61700,
  tier = 'Micro',
  tags = ARRAY['포토그래피', '사진', '카메라', '여행사진', 'Lightroom'],
  primary_region = '서울',
  phone = '010-9978-5567',
  website = 'https://www.instagram.com/hyunwoo.photo',
  price_video = 545000,
  price_feed = 258000,
  price_story = 118000
WHERE email = 'mock_hyunwoophoto@mock.creadypick.com';

-- 호진셰프 (요리/셰프 남성)
UPDATE public.profiles SET
  description = '호텔 출신 셰프의 집에서 만드는 레스토랑 요리 👨‍🍳 양식, 한식 퓨전, 소스 만들기. 근사한 요리를 집 부엌에서 재현합니다.',
  instagram_handle = '@hojin.chef',
  followers_count = 73400,
  tier = 'Micro',
  tags = ARRAY['요리', '셰프', '레시피', '양식', '쿠킹'],
  primary_region = '서울',
  phone = '010-2245-8891',
  website = 'https://www.youtube.com/@hojinchef',
  price_video = 640000,
  price_feed = 300000,
  price_story = 138000
WHERE email = 'mock_hojinchef@mock.creadypick.com';
