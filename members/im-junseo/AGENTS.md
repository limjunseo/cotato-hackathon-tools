# 임준서 담당 영역 AI 규칙

## 소유 범위

임준서 기능은 `members/im-junseo/features/` 아래에서만 구현합니다.

현재 기능:

- `hackathon-timer`: 코커톤 고정 일정 타이머

## 허용되는 변경

- 임준서 기능의 코드·테스트·문서
- `members/im-junseo/feature-manifest.ts`
- 사용자가 명시적으로 요청한 경우에만 공통 패키지와 포털

## 금지되는 변경

사용자 허가 없이 다음 경로를 수정하지 않습니다.

- `members/park-hyeonjeong/`
- `members/kim-gimin/`
- 다른 구성원의 manifest

## 등록 규칙

새 기능 package 이름은 `@cotato/<feature-id>` 형식으로 작성합니다. 담당자 정보는 반드시 다음 값을 사용합니다.

```ts
owner: {
  id: 'im-junseo',
  name: '임준서',
}
```

작업 후 기능 단독 검증과 루트 `pnpm check`를 모두 실행합니다.
