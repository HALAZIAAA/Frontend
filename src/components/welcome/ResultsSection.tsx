import { ArrowRightIcon } from '@phosphor-icons/react'
import CountUp from './CountUp'
// 사진: 푸르메재단 누리집 글 「나만의 창업 아이디어로 도약하다」(purme.org/board/story/8225)에 실린 선발팀 사진에서
// 우리 팀(잇점) 부분만 잘라 낸 것. 팀원들이 싣는 데 동의했다(2026-11-21, 사용자 확인). 사진 아래에 출처를 적는다.
import teamPhoto from '../../assets/welcome/contest-team.jpg'

// 점역가 평가 1~4차: 참여 인원과 평점, 그때 받은 평가 한 줄만 보여 준다.
// 위에 숫자 셋, 그 아래 차수 네 칸(평점 둘과 점역가의 한마디). 숫자는 올라가고, 평점 막대는 자라고, 한마디는 말풍선으로 떠오른다.
//
// 근거: Notion 개발 로그 「2026-11-10 BridgeOn 4차 평가 피드백과 1~4차 평가 흐름」(2026-11-20 갱신)과
// 「2026-10-15 BridgeOn 피드백 1~3차 종합: 출력 형식 기준」. 피드백지 원본이 이 컴퓨터에 다 있지 않아 그 기록에 정리된 값을 옮겼다.
// 피드백지는 26장(1차 10, 2차 8, 3차 4, 4차 4)이지만 화면에는 장수를 적지 않는다. 참여한 사람은 사용자가 알려 준 대로 11명으로 적는다(2026-11-20).
// 위 기록의 1차 참여자 명단에는 10명이 적혀 있다. 이름과 소속, 답변 원문은 싣지 않는다.
//
// 평점은 5점 만점 문항 둘의 평균이다(설명문을 검수 전 초안으로 쓸 수 있는가, 문서 구성과 형식이 작업을 시작하기에 알맞은가).
// 1·2차는 그 기록에 자료 A·B별 평균으로 적혀 있어서, 응답 수로 합계를 되살려 한 값으로 합쳤다.
//   1차 설명문 4.11(9장)·4.22(9장) → 75/18 = 4.17, 형식 3.44·3.67 → 64/18 = 3.56
//   2차 설명문 4.14(7장)·3.38(8장) → 56/15 = 3.73, 형식 3.29·3.88 → 54/15 = 3.60
// 3·4차는 평가자마다 자료가 달라 처음부터 한 값이다. 평점이 매번 오른 것은 아니므로(2차 설명문, 3차 형식이 내려갔다)
// '계속 올랐다'고 쓰지 않고 네 차수의 값을 그대로 보여 준다.

// before가 있으면 1차 값에서 4차 값으로 올라가는 숫자로 보여 준다.
const SUMMARY: Array<{ label: string; before?: number; value: number; digits: number; suffix: string; note: string }> = [
  { label: '참여한 점역가', value: 11, digits: 0, suffix: '명', note: '2026년 8월부터 11월까지 네 차례 평가했어요.' },
  {
    label: '설명문을 초안으로 쓸 수 있나요?',
    before: 4.17,
    value: 4.25,
    digits: 2,
    suffix: '',
    note: '1차와 4차의 평점이에요. 5점 만점이에요.',
  },
  {
    label: '문서 형식이 작업하기에 알맞나요?',
    before: 3.56,
    value: 4,
    digits: 2,
    suffix: '',
    note: '1차와 4차의 평점이에요. 5점 만점이에요.',
  },
]

// said는 그 차수에 받은 평가 가운데 한 줄을 그대로 옮긴 것이다(이름과 소속은 싣지 않는다).
//   1차: 1차 피드백 정리 문서에 적힌 문장. 2차·4차: Notion 기록에 원문으로 적힌 문장.
//   3차: 원문이 이 컴퓨터에 없어 Notion에 요지로 적힌 문장을 썼다. 그래서 quoted를 false로 두고 따옴표를 붙이지 않는다.
// 4차는 평가한 날짜가 아니라 피드백지를 받은 날짜만 확인됐다.
type Round = {
  round: string
  when: string
  what: string
  describe: number
  format: number
  said: string
  quoted: boolean
  best?: boolean
}

const ROUNDS: Round[] = [
  {
    round: '1차',
    when: '2026년 8월 19일~9월 2일',
    what: 'DOCX 결과물',
    describe: 4.17,
    format: 3.56,
    said: '파일 형식은 txt가 좋습니다.',
    quoted: true,
  },
  {
    round: '2차',
    when: '2026년 9월 28일~10월 8일',
    what: 'TXT 결과물',
    describe: 3.73,
    format: 3.6,
    said: '1차 테스트 때보다 많이 개선 되었다고 생각됩니다.',
    quoted: true,
  },
  {
    round: '3차',
    when: '2026년 10월 13일~14일',
    what: '점역가가 직접 변환',
    describe: 4.0,
    format: 3.25,
    said: '일반 텍스트는 오타 없이 95% 이상 그대로 활용 가능',
    quoted: false,
  },
  {
    round: '4차',
    when: '2026년 11월 10일·20일에 받음',
    what: '점역가가 직접 변환',
    describe: 4.25,
    format: 4.0,
    said: '3차보다도 보완된 부분이 훨씬 많아진 것 같아서 놀랍습니다.',
    quoted: true,
    best: true,
  },
]

// 평점 한 줄: 이름과 올라가는 숫자, 그 아래 0~5점 길이의 막대. delay로 칸마다 조금씩 늦게 움직인다.
function Score({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <span className="welcome-score">
      <span className="welcome-score-label">{label}</span>
      <span className="welcome-score-value">
        <CountUp to={value} digits={2} delay={delay} />
        <span className="sr-only">점</span>
      </span>
      <span className="welcome-score-track" aria-hidden="true">
        <span className="welcome-score-fill" style={{ width: `${(value / 5) * 100}%` }} />
      </span>
    </span>
  )
}

function ResultsSection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-results-title">
      <div className="welcome-section-head">
        <h2 id="welcome-results-title" className="welcome-section-title">
          현장 검토와 평가
        </h2>
        <p className="welcome-section-description">
          점역가 11명이 네 차례 평가했어요. 평점은 4차가 가장 높았어요.
        </p>
      </div>

      <ul className="welcome-kpi-grid" role="list">
        {SUMMARY.map(({ label, before, value, digits, suffix, note }) => (
          <li key={label} className="welcome-kpi">
            <span className="welcome-kpi-label">{label}</span>
            <span className="welcome-kpi-figure">
              {before !== undefined && (
                <>
                  <span className="welcome-kpi-before">
                    <span className="sr-only">1차 </span>
                    {before.toFixed(digits)}
                  </span>
                  <ArrowRightIcon aria-hidden="true" size={20} weight="bold" className="welcome-kpi-arrow" />
                  <span className="sr-only">4차 </span>
                </>
              )}
              <span className="welcome-kpi-value">
                <CountUp from={before ?? 0} to={value} digits={digits} suffix={suffix} />
              </span>
            </span>
            <span className="welcome-kpi-note">{note}</span>
          </li>
        ))}
      </ul>

      <ol className="welcome-rounds" role="list">
        {ROUNDS.map(({ round, when, what, describe, format, said, quoted, best }, index) => (
          <li key={round} className={`welcome-round ${best ? 'is-best' : ''}`}>
            <span className="welcome-round-head">
              <span className="welcome-round-badge">{round}</span>
              {best && <span className="welcome-round-best">최고 평점</span>}
            </span>
            <span className="welcome-round-when">
              {when} · {what}
            </span>
            <Score label="설명문" value={describe} delay={300 + index * 150} />
            <Score label="문서 형식" value={format} delay={300 + index * 150} />
            <span className="welcome-round-said">
              <span className="welcome-round-said-label">점역가의 한마디</span>
              {quoted ? `“${said}”` : said}
            </span>
          </li>
        ))}
      </ol>

      <p className="welcome-how-note">
        평점은 5점 만점의 평균이에요. 1·2차는 강의자료 두 가지를 변환해 보냈고, 두 자료에 매긴 점수를 합쳐 평균을 냈어요.
        3차부터는 점역가가 각자 다른 자료를 직접 올려 평가했어요.
      </p>

      <div className="welcome-story-card is-accent welcome-award">
        <figure className="welcome-award-figure">
          <img
            src={teamPhoto}
            alt="흰 벽 앞에 나란히 선 IT(잇)점 팀원 세 명. 저마다 손가락으로 표시를 만들며 웃고 있다."
            className="welcome-card-photo"
            width={980}
            height={784}
            loading="lazy"
          />
          <figcaption className="welcome-award-credit">사진: 푸르메재단</figcaption>
        </figure>
        <div>
          <h3 className="welcome-story-card-title">공모전 최종 선정</h3>
          <p className="welcome-story-text">
            코스콤·푸르메재단 장애인 IT 창업아이템 공모전에서 서류·발표 심사를 거쳐 최종 선정됐어요. 초기 창업지원금
            400만 원을 받았어요.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ResultsSection
