# 작업 단위와 PR 계획

첫 `main` 커밋은 범위·작업 규칙뿐이다. 다음 3개 브랜치는 실제 구현 순서로 생성되었다. 테스트는 해당 기능의 구현 커밋과 함께 기록했다.

| 순서 | 브랜치 | 대상(base) | 검토할 결정 |
| --- | --- | --- | --- |
| 1 | `codex/instant-skip-engine` | `main` | 이벤트 감지, 클릭 가능 상태, 중복 억제, 오프닝·줄거리 |
| 2 | `codex/next-episode-navigation` | `codex/instant-skip-engine` | 엔딩의 다음 회차만 허용하고 추천작·상시 버튼 제외 |
| 3 | `codex/settings-and-delivery` | `codex/next-episode-navigation` | 사용자 설정, 로컬 저장, 모의 데모와 배포·검증 문서 |

PR 2·3은 앞 PR을 기반으로 한 stacked PR이다. 각 diff는 직전 작업 이후의 변경만 보여준다. PR 1부터 검토·병합하고 다음 PR의 base를 `main`으로 바꾼다. 실제 병합은 사용자의 판단으로 남긴다. 앞 PR을 squash/rebase merge했다면 다음 브랜치에서 중복 커밋 정리가 필요할 수 있으므로 임의 force push하지 않는다.

## 권한과 상태

2026-10-05에 `scripts/publish.mjs`로 저장소와 브랜치를 확인하고 다음 Draft PR을 게시했다. 병합은 수행하지 않았다.

- [PR #1 — 오프닝·줄거리 감지 엔진](https://github.com/ing2720/netflix-supporter/pull/1)
- [PR #2 — 다음 회차 처리 경계](https://github.com/ing2720/netflix-supporter/pull/2)
- [PR #3 — 설정·설치 패키지·검증 문서](https://github.com/ing2720/netflix-supporter/pull/3)

게시 인증은 이 저장소 하나에 한정한 단기 fine-grained token을 사용했으며 전역 GitHub 로그인으로 저장하지 않았다. 스크립트는 이후 재실행에도 같은 저장소와 브랜치를 확인하고 기존 열린 PR을 재사용한다.

초기 기준 브랜치가 없는 빈 저장소에만 문서 bootstrap `main`을 최초로 올린다. 기존 원격 main을 변경하거나 기능 브랜치를 병합하지 않는다.
