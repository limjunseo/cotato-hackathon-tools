# COTATO Merge Race

`8th-COKERTHON` 참가 레포의 default branch PR merge를 팀별 점수로 집계하고, 15초 레이스 연출로 보여주는 임준서 담당 기능입니다.

포털 서버를 먼저 실행하면 GitHub polling과 자동 화면 전환이 함께 동작합니다.

```powershell
pnpm dev
```

루트 `.env.local`에는 서버 전용 `GITHUB_TOKEN`을 설정합니다. `VITE_` 접두사는 사용하지 않습니다.

레이스 화면은 전달받은 픽셀 감자 스프라이트 6종을 팀별로 사용합니다. 자동 presentation 종료 전에는 현재 순위와 깃허브 머지 횟수를 중앙 대형 보드로 3.5초간 보여준 뒤 타이머로 복귀합니다.

기능 화면만 개발할 때는 포털 서버를 실행한 상태에서 아래 명령을 사용합니다.

```powershell
pnpm --filter @cotato/merge-race dev
```

단독 실행 주소는 `http://127.0.0.1:4176`이고, 포털 경로는 `/features/merge-race`입니다.
