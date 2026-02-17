# 🐛 디버깅 시스템 구현 가이드

## 추가된 기능

### 1. **DebugLoadingScreen 컴포넌트**
위치: `/components/debug-loading-screen.tsx`

**핵심 기능**:
- ✅ 어떤 provider가 로딩 중인지 실시간 표시
- ⏱️ 경과 시간 측정 (초 단위)
- ⚠️ 30초 이상 걸리면 자동 경고 표시
- 🔄 재시도 버튼 (에러 발생 시)
- 💡 디버깅 팁 자동 표시

**사용 예시**:
```typescript
<DebugLoadingScreen 
    loadingStates={loadingStates}
    onRetry={refreshAllData}
    showDetails={true}
/>
```

---

### 2. **UnifiedProvider 로딩 상태 노출**

추가된 필드:
```typescript
{
    loadingStates: [
        { name: '인증 시스템', isLoading: true/false },
        { name: '캠페인 데이터', isLoading: true/false },
        { name: '이벤트 데이터', isLoading: true/false },
        { name: '제품 데이터', isLoading: true/false },
        { name: '제안서 데이터', isLoading: true/false },
        { name: '메시지 시스템', isLoading: true/false },
        { name: '즐겨찾기', isLoading: true/false },
    ]
}
```

---

## 🔍 추가 디버깅 팁

### 1. **브라우저 콘솔 활용**

**콘솔에서 확인 가능한 로그**:
```
[UnifiedProvider] Loading Status: {
  campaigns: false,
  events: true,  // ← 이벤트 데이터가 로딩 중!
  proposals: false
}
```

**콘솔 여는 방법**:
- Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

---

### 2. **네트워크 탭 확인**

**확인할 사항**:
1. **Failed 요청** (빨간색) → 에러 발생
2. **Pending 요청** (회색) → 응답 대기 중
3. **느린 요청** (10초 이상) → 성능 문제

**필터링**:
- `XHR` 클릭 → API 요청만 보기
- `Failed` 상태만 필터링

---

### 3. **Performance 프로파일링**

**사용 방법**:
1. 브라우저 DevTools → Performance 탭
2. 녹화 시작 (빨간 점 클릭)
3. 페이지 새로고침
4. 녹화 중지
5. 어느 함수가 오래 걸리는지 확인

---

### 4. **React DevTools 프로파일러**

**설치**:
- Chrome: React Developer Tools 확장 프로그램

**사용**:
1. Components 탭 → Provider 찾기
2. Props 확인 → `isLoading` 상태 보기
3. Profiler 탭 → 렌더링 성능 측정

---

### 5. **Supabase 디버깅**

**느린 쿼리 찾기**:
```typescript
// 콘솔에서 실행
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// 쿼리 시간 측정
console.time('proposals')
const { data } = await supabase
    .from('brand_proposals')
    .select('*')
console.timeEnd('proposals')
```

**RLS 정책 확인**:
- Supabase Dashboard → Authentication → Policies
- 너무 복잡한 policy가 성능 저하 원인

---

### 6. **로딩 타임아웃 설정**

현재 구현된 타임아웃:
- **5초**: 디버그 정보 자동 표시
- **30초**: "평소보다 오래 걸림" 경고

**커스터마이즈**:
```typescript
// debug-loading-screen.tsx
useEffect(() => {
    if (elapsedTime > 10) {  // 10초로 변경
        setShowDebug(true)
    }
}, [elapsedTime])
```

---

### 7. **에러 경계 (Error Boundary) 추가 권장**

미래에 추가하면 좋을 기능:
```typescript
class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        console.error('Provider Error:', error, errorInfo)
        // Sentry 등으로 전송
    }
}
```

---

### 8. **로컬스토리지 디버그 모드**

**구현 예시**:
```typescript
// 브라우저 콘솔에서
localStorage.setItem('debug', 'true')

// 코드에서
const isDebugMode = localStorage.getItem('debug') === 'true'

<DebugLoadingScreen 
    showDetails={isDebugMode}  // 자동으로 상세 정보 보기
/>
```

---

### 9. **Provider별 에러 핸들링**

**각 Provider에 추가하면 좋음**:
```typescript
const [error, setError] = useState<string | null>(null)

try {
    // fetch data
} catch (err) {
    setError(err.message)
    console.error('[CampaignProvider] Error:', err)
}
```

---

### 10. **Lighthouse 성능 측정**

**사용 방법**:
1. Chrome DevTools → Lighthouse 탭
2. "Performance" 체크
3. "Analyze page load" 클릭
4. First Contentful Paint, Time to Interactive 확인

**목표**:
- First Contentful Paint: < 1.8초
- Time to Interactive: < 3.8초
- Total Blocking Time: < 300ms

---

## 🎯 일반적인 무한 로딩 원인

### 1. **무한 리렌더링**
```typescript
// ❌ 나쁜 예
useEffect(() => {
    setData(newData)  // 의존성 배열 없음 → 무한 루프!
})

// ✅ 좋은 예
useEffect(() => {
    setData(newData)
}, []) // 빈 배열 → 한 번만 실행
```

### 2. **Promise가 resolve되지 않음**
- API 응답이 오지 않음
- `await` 빠트림
- timeout 설정 안 함

### 3. **RLS 정책 문제**
- 권한 없는 데이터 접근
- 재귀 정책 (무한 루프)

### 4. **너무 많은 데이터 fetch**
- 페이지네이션 없이 전체 조회
- JOIN이 너무 많음

---

## 💡 프로덕션 권장 사항

1. **Sentry 연동**: 실시간 에러 모니터링
2. **성능 모니터링**: New Relic, DataDog
3. **로그 수집**: LogRocket, FullStory
4. **API 모니터링**: Supabase Dashboard → API → Logs

---

이제 로딩이 멈추면 **정확히 어디서 문제인지** 한눈에 볼 수 있습니다! 🎉
