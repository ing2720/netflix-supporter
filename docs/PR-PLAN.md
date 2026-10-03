# 작업 단위와 PR 계획

첫 `main` 커밋은 범위·작업 규칙뿐이다. 다음 3개 브랜치는 실제 구현 순서로 생성되었다. 테스트는 해당 기능의 구현 커밋과 함께 기록했다.

| 순서 | 브랜치 | 대상(base) | 검토할 결정 |
| --- | --- | --- | --- |
| 1 | `codex/instant-skip-engine` | `main` | 이벤트 감지, 클릭 가능 상태, 중복 억제, 오프닝·줄거리 |
| 2 | `codex/next-episode-navigation` | `codex/instant-skip-engine` | 엔딩의 다음 회차만 허용하고 추천작·상시 버튼 제외 |
| 3 | `codex/settings-and-delivery` | `codex/next-episode-navigation` | 사용자 설정, 로컬 저장, 모의 데모와 배포·검증 문서 |

PR 2·3은 앞 PR을 기반으로 한 stacked PR이다. 각 diff는 직전 작업 이후의 변경만 보여준다. PR 1부터 검토·병합하고 다음 PR의 base를 `main`으로 바꾼다. 실제 병합은 사용자의 판단으로 남긴다. 앞 PR을 squash/rebase merge했다면 다음 브랜치에서 중복 커밋 정리가 필요할 수 있으므로 임의 force push하지 않는다.

## 권한과 상태

이 문서는 원격 PR이 이미 만들어졌다는 뜻이 아니다. 실제 게시 여부는 GitHub에서 확인해야 한다. 저장소 전송 및 PR 작성 인증이 준비되면 `scripts/publish.mjs`가 정확한 저장소와 이 3개 브랜치를 검증한 뒤 순차 게시한다.

초기 기준 브랜치가 없는 빈 저장소에만 문서 bootstrap `main`을 최초로 올린다. 기존 원격 main을 변경하거나 기능 브랜치를 병합하지 않는다.
