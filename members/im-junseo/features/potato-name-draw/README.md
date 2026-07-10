# 행운의 감자 이름 추첨

쉼표로 구분한 2~12명의 이름 중 서로 다른 2명을 브라우저의 `crypto.getRandomValues()`로 추첨하는 일회성 행사 도구입니다.

## 흐름

`INPUT → READY → SHUFFLING → LOCKING → REVEAL_FIRST → REVEAL_SECOND → COMPLETE`

- `뽑기!` 버튼을 누르는 순간 결과가 확정되고, 연출은 결과 결정과 분리됩니다.
- COMPLETE 화면은 자동으로 종료되거나 초기화되지 않습니다.
- `?debug=1`로 접속한 경우에만 리허설용 RESET 버튼이 표시됩니다.

## 실행

```powershell
pnpm --filter @cotato/potato-name-draw dev
```

## 검증

```powershell
pnpm --filter @cotato/potato-name-draw test
pnpm --filter @cotato/potato-name-draw build
```
