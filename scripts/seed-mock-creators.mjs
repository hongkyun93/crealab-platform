/**
 * seed-mock-creators.mjs
 * mock 크리에이터 프로필 전체 초기화 (기본 + 추가 필드 통합 실행)
 * 실행: node scripts/seed-mock-creators.mjs
 */

import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('=== [1/2] 기본 프로필 데이터 적용 중 ===')
execSync(`node ${path.join(__dirname, 'apply-creator-profiles.mjs')}`, { stdio: 'inherit' })

console.log('\n=== [2/2] 추가 필드(계좌/법적정보/주소/단가) 적용 중 ===')
execSync(`node ${path.join(__dirname, 'apply-creator-profiles-extra.mjs')}`, { stdio: 'inherit' })

console.log('\n✅ 전체 완료!')
