# 기능 개발 가이드

AI와 사람이 동일한 절차로 기능을 추가하기 위한 문서입니다.

## 1. 작업 권한 확인

최상위 `AGENTS.md`와 자신의 `members/<owner>/AGENTS.md`를 읽습니다. 다른 구성원 폴더 변경이 필요하면 구현 전에 사용자 허가를 받습니다.

## 2. 템플릿 복사

```powershell
Copy-Item -Recurse templates\feature members\<owner>\features\<feature-id>
```

`<feature-id>`는 영문 kebab-case를 사용합니다.

## 3. 패키지 이름 수정

`package.template.json`을 `package.json`으로 변경하고 다음 값을 고칩니다.

- 패키지 이름: `@cotato/<feature-id>`
- 개발 서버 포트
- 필요한 의존성

## 4. 기능 manifest 작성

```ts
import type { FeatureDefinition } from '@cotato/contracts'

export const exampleFeature: FeatureDefinition = {
  id: 'example-feature',
  title: '예시 기능',
  owner: {
    id: 'park-hyeonjeong',
    name: '박현정',
  },
  description: '포털 카드에 표시할 설명입니다.',
  path: '/features/example-feature',
  status: 'ready',
  accent: '#4e8cff',
  load: () => import('./App'),
}
```

## 5. 구성원 manifest에 등록

```ts
import { exampleFeature } from '@cotato/example-feature/manifest'

export const parkHyeonjeongFeatures = [exampleFeature]
```

새 구성원을 추가하는 경우가 아니라면 포털 registry는 수정할 필요가 없습니다.

## 6. 검증

```powershell
pnpm install
pnpm --filter @cotato/<feature-id> test
pnpm --filter @cotato/<feature-id> build
pnpm dev
```

포털에서 다음 항목을 확인합니다.

- 올바른 담당자 영역에 카드가 표시되는가
- 카드 제목과 설명이 올바른가
- 실행 버튼이 기능 URL로 이동하는가
- 포털로 돌아가기 버튼이 작동하는가
- 직접 URL 새로고침 후에도 기능이 표시되는가

마지막으로 루트에서 실행합니다.

```powershell
pnpm check
```

## AI 완료 체크리스트

- 담당자 경계를 지켰는가
- 다른 사람의 manifest를 수정하지 않았는가
- 기능 ID와 URL이 사람 이름에 의존하지 않는가
- manifest 타입 오류가 없는가
- 기능 단독 실행이 가능한가
- 포털에서 실행 가능한가
- 테스트·린트·빌드 결과를 사용자에게 보고했는가
