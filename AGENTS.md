# COTATO Hackathon Tools AI 작업 규칙

이 문서는 저장소에서 작업하는 모든 AI 에이전트가 가장 먼저 읽어야 하는 최상위 지침입니다.

## 저장소 목적

이 저장소는 COTATO 해커톤 운영 도구를 하나의 포털에서 제공하는 pnpm 모노레포입니다. 각 구성원은 자신의 폴더에서 독립적으로 기능을 개발하고, 최상위 포털은 구성원별 `feature-manifest.ts`를 읽어 기능을 노출합니다.

## 소유권과 수정 경계

- 임준서 담당 영역: `members/im-junseo/`
- 박현정 담당 영역: `members/park-hyeonjeong/`
- 김기민 담당 영역: `members/kim-gimin/`
- 공통 포털: `apps/portal/`
- 공통 계약과 UI: `packages/`

AI는 사용자가 지정한 담당자 폴더만 수정해야 합니다. 다른 구성원의 폴더를 수정해야 한다면 작업을 멈추고 사용자에게 먼저 허가를 요청합니다.

다음 영역도 명시적인 요청 없이 변경하지 않습니다.

- 다른 구성원의 `feature-manifest.ts`
- 공통 계약인 `packages/contracts/`
- 공통 UI인 `packages/ui/`
- 포털의 전역 디자인이나 라우팅 정책

새 기능을 포털에 등록하는 데 필요한 최소한의 manifest 연결은 허용되지만 기존 구성원의 등록 항목은 수정하지 않습니다.

## 필수 구조

각 기능은 다음 구조를 따릅니다.

```text
members/<owner>/features/<feature-id>/
├─ package.json
├─ src/
│  ├─ App.tsx
│  └─ feature.ts
└─ README.md
```

`src/feature.ts`는 `@cotato/contracts`의 `FeatureDefinition`을 만족하는 manifest를 내보내야 합니다.

필수 필드:

- `id`: 저장소 전체에서 고유한 kebab-case ID
- `title`: 포털에 표시할 기능명
- `owner`: 담당자 ID와 이름
- `description`: 한두 문장의 기능 설명
- `path`: `/features/<feature-id>` 형식의 URL
- `status`: `ready`, `beta`, `planned` 중 하나
- `load`: React 기능을 동적으로 불러오는 함수

## 라우팅 및 이름 규칙

- URL과 기능 ID에는 담당자 이름을 포함하지 않습니다.
- 담당자가 바뀌어도 기능 URL은 유지되어야 합니다.
- 폴더와 패키지 이름은 영문 kebab-case를 사용합니다.
- React 컴포넌트는 PascalCase를 사용합니다.
- 공통 코드가 아닌 기능 전용 코드는 담당자 폴더 안에 둡니다.

## UI 규칙

- 포털의 공통 카드와 배지는 `@cotato/ui`를 사용합니다.
- 기능 내부 UI는 독립적으로 구성할 수 있습니다.
- 기능 화면은 포털 경로와 독립 실행 양쪽에서 정상 동작해야 합니다.
- 다른 기능의 CSS에 영향을 주는 전역 선택자를 추가하지 않습니다.
- 접근 가능한 버튼 이름과 키보드 포커스를 제공합니다.

## 작업 순서

1. 최상위 `AGENTS.md`를 읽습니다.
2. 작업 대상 구성원의 `AGENTS.md`를 읽습니다.
3. `docs/ARCHITECTURE.md`와 `docs/FEATURE_DEVELOPMENT.md`를 확인합니다.
4. 담당자 폴더 안에서 구현합니다.
5. 담당자 `feature-manifest.ts`에 기능을 등록합니다.
6. 기능 단독 테스트를 실행합니다.
7. 루트에서 전체 검증을 실행합니다.

## 필수 검증

```powershell
pnpm lint
pnpm test
pnpm build
```

기능 단독 실행:

```powershell
pnpm --filter <package-name> dev
```

포털 실행:

```powershell
pnpm dev
```

검증 실패를 무시하거나 테스트를 삭제해서 통과시키지 않습니다.
