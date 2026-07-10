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

Commit Race 기능만 실행:

```powershell
pnpm dev:merge-race
```

Commit Race 단독 주소: `http://127.0.0.1:4176`

## 실시간 Commit Race

루트 `.env.local`에 서버 전용 GitHub token을 설정하면 포털 Vite 서버가 `8th-COKERTHON`의 merge를 5초마다 확인합니다. 신규 merge가 트리거되면 행사 시작 이후 각 저장소 default branch의 실제 커밋 수가 팀 점수와 순위에 반영됩니다.

```dotenv
GITHUB_TOKEN=github_pat_...
```

`VITE_GITHUB_TOKEN`처럼 `VITE_` 접두사를 사용하면 브라우저 번들에 노출될 수 있으므로 사용하지 않습니다. 타이머에서는 신규 merge가 감지되면 15초 동안 Commit Race로 자동 전환되고, 감자 추첨 화면에서는 이벤트만 대기열에 저장합니다.

Commit Race를 기본 운영 화면으로 띄워둔 경우에는 화면을 전환하지 않고, 현재 화면에서 merge 팀 알림과 효과음을 재생한 뒤 커밋 수 기준 점수와 순위를 갱신합니다.

## 수동 동기화

코드 동기화는 필요할 때만 수동으로 실행합니다. Commit Race의 점수 감시는 코드 동기화와 별개로 Vite 서버에서 자동 실행됩니다.

- VS Code에서 `Sync latest from GitHub` 작업을 실행합니다.
- 같은 동작을 터미널에서 직접 하려면 `scripts/sync-latest.cmd`를 실행합니다.
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
