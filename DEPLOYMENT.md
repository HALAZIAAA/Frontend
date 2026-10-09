# 운영 사이트 자동 배포

`main`에 push하거나 PR을 merge하면 GitHub Actions가 프론트를 빌드하고 기존 Lightsail 서버에 적용한다. 로컬 commit만으로는 배포되지 않는다. 다른 브랜치는 배포 대상이 아니다.

- 사이트: https://bridgeonit.com
- API: https://api.bridgeonit.com
- 배포 결과: 저장소의 **Actions → Deploy frontend to Lightsail**

Node 24에서 잠금 파일 기준으로 의존성을 설치하고 TypeScript 검사·Vite 빌드를 통과한 결과만 배포한다. 빌드할 때 `VITE_BACKEND_ORIGIN=https://api.bridgeonit.com`을 적용한다. 빌드와 서버 접속은 별도 작업으로 분리했다.

서버에서는 새 폴더에 파일을 설치한 후 연결을 교체한다. 공개 HTTPS 확인에 실패하면 이전 버전 연결로 되돌린다. 실행이 초록색이면 서버 적용과 공개 화면 확인까지 통과한 것이다.

실패한 실행은 Actions의 **Re-run jobs**, 수동 배포는 **Run workflow → main**으로 실행한다. 이전 기능으로 복구하려면 해당 코드 변경을 revert해 main에 push한다.

서버 접속 키는 GitHub Actions Secrets에만 보관하며 코드에 넣지 않는다. Google 로그인용 클라이언트 ID 등 새 빌드 설정이 필요하면 workflow의 빌드 환경변수도 함께 검토한다.
