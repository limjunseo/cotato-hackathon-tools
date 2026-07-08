# 김기민 담당 영역 AI 규칙

## 소유 범위

김기민 기능은 `members/kim-gimin/features/` 아래에서만 구현합니다.

## 시작 방법

`features/_template/README.md`와 최상위 `templates/feature/`를 참고해 새 기능을 생성합니다.

## 허용되는 변경

- 김기민 기능의 코드·테스트·문서
- `members/kim-gimin/feature-manifest.ts`
- 사용자가 명시적으로 요청한 경우에만 공통 패키지와 포털

## 금지되는 변경

사용자 허가 없이 다음 경로를 수정하지 않습니다.

- `members/im-junseo/`
- `members/park-hyeonjeong/`
- 다른 구성원의 manifest

## 등록 규칙

```ts
owner: {
  id: 'kim-gimin',
  name: '김기민',
}
```

기능 URL과 ID에는 사람 이름을 넣지 않습니다. 작업 후 기능 단독 검증과 루트 `pnpm check`를 모두 실행합니다.
