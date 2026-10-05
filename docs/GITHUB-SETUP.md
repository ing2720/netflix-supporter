# GitHub 인증과 게시

공개 저장소라도 Git 전송과 PR 작성에는 인증이 필요하다. 브라우저의 GitHub 로그인과 Git/CLI 인증은 별개다.

## 저장소 하나에 제한하는 방법

GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens에서 사용자가 직접 새 토큰을 만든다.

- Resource owner: `ing2720`
- Repository access: **Only select repositories → netflix-supporter**
- Repository permissions: **Contents: Read and write**, **Pull requests: Read and write**, **Workflows: Read and write** (CI 워크플로 파일 push용)
- 짧은 만료 기간을 선택한다. 토큰은 채팅·소스·PR에 붙여 넣지 않는다.

토큰을 사용하는 경우 아래 명령을 macOS 터미널의 이 프로젝트 폴더에서 실행할 수 있다. 입력 문자는 표시하지 않고, 파일이나 전역 GitHub 로그인 저장소에 토큰을 저장하지 않는다. 실행이 끝나면 하위 셸과 함께 환경 변수도 사라진다.

```sh
zsh -c 'read -rs "GH_TOKEN?Repository-only GitHub token: "; print; export GH_TOKEN; node scripts/publish.mjs --publish'
```

토큰이 이 저장소에만 한정되었는지는 발급 화면에서 확인해야 한다. 스크립트의 저장소 제한은 추가 실수 방지이며 계정 권한 격리를 대신하지 않는다. 이미 다른 넓은 권한 인증이 실행 환경에 있다면 그 인증까지 제한하는 것은 아니다.

## 기존 일반 로그인 사용

사용자가 일반 계정 연결을 선택한 경우 `gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key`로 로그인한 뒤 게시할 수 있다. 이 로그인은 저장소 전용이 아니며 사용자의 다른 저장소에도 적용될 수 있다.

## 게시 전 계획 확인

```sh
node scripts/publish.mjs
```

이 명령은 저장소 URL·브랜치 의존성·깨끗한 작업 상태를 확인하고 계획만 출력한다. `--publish`일 때만 원격으로 올린다.

스크립트는 빈 원격의 문서 전용 main을 최초 생성한 뒤, 3개 작업 브랜치와 Draft PR을 순서대로 올린다. 병합·force push·원격 삭제·보호 설정 변경은 하지 않는다. 이미 게시된 열린 PR은 재사용한다. 도중 실패해도 기존 PR을 중복 생성하지 않도록 확인한다.

## 이 컴퓨터에서 확인한 전송 문제

기존 전역 Git 설정이 GitHub HTTPS 주소를 SSH로 바꾸고 있었다. 전역 설정은 유지하고, 이 저장소의 정확한 URL에만 더 구체적인 HTTPS 예외를 로컬 `.git/config`에 적용했다. 이 설정 자체는 인증을 추가하지 않는다.

## 참고

- [Fine-grained personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub CLI authentication](https://cli.github.com/manual/gh_auth_login)
