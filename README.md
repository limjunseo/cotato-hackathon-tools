# COTATO Hackathon Tools

구성원별 기능을 독립적으로 개발하고 하나의 COTATO 포털에서 실행하는 pnpm 모노레포입니다.

## 구성원

| 구성원 | 작업 폴더 | 등록 파일 |
| --- | --- | --- |
| 임준서 | `members/im-junseo/` | `members/im-junseo/feature-manifest.ts` |
| 박현정 | `members/park-hyeonjeong/` | `members/park-hyeonjeong/feature-manifest.ts` |
| 김기민 | `members/kim-gimin/` | `members/kim-gimin/feature-manifest.ts` |

## 설치 및 실행

```powershell
pnpm install
pnpm dev
```

포털: `http://127.0.0.1:4173`

임준서의 해커톤 타이머만 실행:

```powershell
pnpm dev:timer
```

타이머 단독 주소: `http://127.0.0.1:4174`

## 수동 동기화

자동 감시는 하지 않고, 필요할 때만 GitHub 최신 내용을 반영합니다.

- VS Code에서 `Sync latest from GitHub` 작업을 실행합니다.
- 같은 동작을 터미널에서 직접 하려면 `scripts/sync-latest.ps1`를 실행합니다.
- 이 작업은 현재 브랜치에 대해 `git pull --ff-only`만 수행합니다.

## 전체 검증

```powershell
pnpm check
```

## 새 기능 개발

1. 자신의 `members/<owner>/AGENTS.md`를 읽습니다.
2. `templates/feature/`를 자신의 `features/<feature-id>/`로 복사합니다.
3. 기능 패키지와 `src/feature.ts`를 구현합니다.
4. 자신의 `feature-manifest.ts`에 기능을 추가합니다.
5. 단독 실행과 포털 실행을 모두 확인합니다.

상세 내용은 [기능 개발 가이드](docs/FEATURE_DEVELOPMENT.md)와 [아키텍처](docs/ARCHITECTURE.md)를 참고합니다.
