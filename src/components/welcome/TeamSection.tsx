type Member = {
  name: string
  role: string
  work: string
  tone: 'green' | 'rose' | 'amber'
}

// 맡은 일 근거: 각 저장소의 커밋 기록과 개발과정 정리 문서. 깃허브 주소는 싣지 않는다.
const MEMBERS: Member[] = [
  {
    name: '최수민',
    role: '백엔드',
    work: '업로드 검증, 변환 파이프라인 뼈대, 오류 처리와 로그, 변환 취소, 24시간 뒤 파일 정리',
    tone: 'amber',
  },
  {
    name: '구병모',
    role: 'AI 모델',
    work: '그림 설명 모델 비교와 추가 학습, 평가 자료 구축, 글자 인식·그림 설명·원고 정리를 하는 AI 서버',
    tone: 'green',
  },
  {
    name: '이지현',
    role: '프론트엔드',
    work: '파일 변환과 미리보기 화면, 커뮤니티와 마이페이지, Google 로그인, 채용공고 수집',
    tone: 'rose',
  },
]

function TeamSection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-team-title">
      <div className="welcome-section-head">
        <h2 id="welcome-team-title" className="welcome-section-title">
          BridgeOn을 만드는 사람들
        </h2>
        <p className="welcome-section-description">
          팀 이름은 IT(잇)점이에요. IT 기술로 점역가와 시각장애 학습자, 대체자료 제작 현장을 &lsquo;잇&rsquo;겠다는 뜻에
          점역(點譯)의 &lsquo;점&rsquo;을 붙였어요.
        </p>
      </div>

      <ul className="welcome-team-grid" role="list">
        {MEMBERS.map((member) => (
          <li key={member.name} className="welcome-team-card">
            <span className={`welcome-avatar tone-${member.tone}`} aria-hidden="true">
              {member.name.slice(0, 1)}
            </span>
            <span className="welcome-team-name">{member.name}</span>
            <span className="welcome-team-role">{member.role}</span>
            <span className="welcome-team-work">{member.work}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TeamSection
