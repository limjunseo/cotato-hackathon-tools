# 아키텍처

## 목표

각 구성원이 자신의 기능을 독립적으로 구현하면서도 최종 사용자는 하나의 포털에서 모든 기능을 실행할 수 있게 합니다.

## 계층

```text
Portal
  └─ Member manifests
       └─ Feature packages
            ├─ Feature UI
            ├─ Feature tests
            └─ Standalone entry

Shared packages
  ├─ contracts
  ├─ ui
  └─ shared
```

### `apps/portal`

- 구성원 manifest를 합칩니다.
- 홈 화면에서 담당자별 기능을 표시합니다.
- manifest의 `path`에 따라 기능을 동적으로 로드합니다.
- 기능 구현 세부사항을 알지 않습니다.

### `members/<owner>`

- 구성원의 기능 소유 영역입니다.
- `feature-manifest.ts`는 해당 구성원의 공개 기능 목록입니다.
- 다른 구성원의 코드를 직접 import하지 않습니다.

### `members/<owner>/features/<feature-id>`

- 하나의 독립 기능 패키지입니다.
- 포털에서 React 모듈로 로드할 수 있습니다.
- 필요하다면 Vite를 통해 단독 실행할 수 있습니다.
- 기능별 테스트, 자산, 스타일은 패키지 안에 둡니다.

### `packages/contracts`

포털과 기능 사이의 안정적인 계약만 포함합니다. 기능별 비즈니스 로직을 넣지 않습니다.

### `packages/ui`

포털 공통 카드와 배지처럼 여러 기능에서 공유할 가치가 있는 UI만 포함합니다. 기능 전용 컴포넌트를 넣지 않습니다.

### `packages/shared`

프레임워크에 의존하지 않는 작은 공통 유틸리티를 포함합니다.

## 기능 발견 과정

```text
feature/src/feature.ts
        ↓
member/feature-manifest.ts
        ↓
portal/feature-registry.ts
        ↓
홈 카드 및 /features/<id> 라우트
```

포털은 기능 폴더를 파일 시스템에서 자동 검색하지 않습니다. 명시적인 manifest 등록을 통해 누가 어떤 기능을 공개했는지 코드 리뷰에서 확인할 수 있게 합니다.

## 실행 모델

`pnpm dev`는 포털 한 개만 실행합니다. 포털은 workspace 패키지의 소스를 직접 불러옵니다.

개발자가 기능 하나에만 집중할 때는 해당 기능의 `dev` 명령을 실행합니다. 이는 개발 편의를 위한 것이며 최종 사용자에게 여러 서버를 노출한다는 뜻이 아닙니다.

## 의존성 방향

```text
portal → member manifest → feature → contracts/shared
portal → ui → contracts
```

다음 의존성은 금지합니다.

- 기능에서 포털 import
- 한 구성원 기능에서 다른 구성원 기능 import
- 공통 패키지에서 특정 기능 import
- URL에 담당자 이름 포함
