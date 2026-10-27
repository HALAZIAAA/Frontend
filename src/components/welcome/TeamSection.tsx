type Member = {
  name: string
  role: string
  tone: 'green' | 'rose' | 'amber'
}

const MEMBERS: Member[] = [
  { name: '최수민', role: '백엔드', tone: 'amber' },
  { name: '구병모', role: 'AI 모델', tone: 'green' },
  { name: '이지현', role: '프론트엔드', tone: 'rose' },
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
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TeamSection
