import type { CSSProperties } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import CountUp from './CountUp'
import ModelDetails from './ModelDetails'
import { useInViewOnce } from '../../lib/useInViewOnce'

// AI 모델 섹션. 내용은 졸업작품 산출물(팀 4-01, 2026-11-18 저장본)에서 옮겼다(사용자 요청, 2026-11-21).
//   - 프로젝트 관리 계획서(Doc-002) 2.3절 「AI 모델 개발 및 검증」: 처리 단계별 처리 방식(표 2-1),
//     모델별 설명문 평가 결과(표 2-6), 범용 AI와의 비교(그림 2-1), 7절 「기타 사항」의 한계 설명
//   - 프로젝트 결과보고서(Doc-008)의 시스템 활용 효과
// 숫자를 고칠 때는 그 문서와 다시 맞춘다. 학습에 걸린 시간은 사용자 요청으로 적지 않는다.
// 위에는 그림 하나와 큰 숫자만 두고, 모델을 고른 이유·학습 설정·평가 방법 같은 자세한 내용은 ModelDetails의 접히는 줄에 둔다.
// 2026년 11월 차트 평가(261장)로 만들었던 예전 내용은 저장소 밖 보관 폴더에 있다.

// 처리 단계 여섯 개와 그 일을 누가 하는지(표 2-1). 정답이 정해진 일은 코드가, 판단이 필요한 일은 AI가 한다.
const SPLIT: Array<{ who: 'code' | 'ai'; title: string; sub: string }> = [
  { who: 'code', title: '원본 파일 읽기', sub: '글자, 강조, 표, 쪽 번호' },
  { who: 'ai', title: '이미지 속 글자 읽기', sub: '스캔 PDF, 그림 안의 글자' },
  { who: 'ai', title: '그림·표 설명 쓰기', sub: '그림, 표, 그래프, 도형' },
  { who: 'ai', title: '문서 구조 판단', sub: '제목 단계, 읽는 순서' },
  { who: 'code', title: '점역 규칙 적용', sub: '들여쓰기, 쪽 표시, 표·그림 경계' },
  { who: 'code', title: '형식 검사', sub: '원문이 바뀌면 파일을 만들지 않음' },
]

// 추가 학습(LoRA 미세조정) 전과 후의 설명문 평가(표 2-6의 'Qwen3.5-4B 기본' 줄과 'LoRA 적용' 줄).
// 화면에는 소수 둘째 자리까지 적는다. 문서의 값은 정확도 0.5225 → 0.762, 완전성 0.5143 → 0.79, 언어 적절성 3.08 → 4.33,
// 오해율 2.595 → 1.35이고, ModelDetails의 표에 그대로 있다.
const KPIS: Array<{ label: string; before: string; value: number; note: string }> = [
  { label: '정확도', before: '0.52', value: 0.76, note: '핵심 정보를 맞게 말한 비율이에요. 1에 가까울수록 좋아요.' },
  {
    label: '완전성',
    before: '0.51',
    value: 0.79,
    note: '들어가야 할 내용을 빠뜨리지 않은 비율이에요. 1에 가까울수록 좋아요.',
  },
  { label: '언어 적절성', before: '3.08', value: 4.33, note: '문장이 자연스러운 정도예요. 5점 만점이에요.' },
  {
    label: '오해율',
    before: '2.60',
    value: 1.35,
    note: '틀리거나 그림에 없는 내용을 말한 정도예요. 낮을수록 좋아요.',
  },
]

// 범용 AI에 점역 규칙을 프롬프트로 주고 같은 채점 기준으로 견준 결과(그림 2-1, 사회학원론 PPTX 21쪽 기준).
// 범용 AI는 Gemini 3.8 Flash이고 두 번 실행했다. 다섯 지표 가운데 셋만 여기에 두고, 전부는 ModelDetails에 둔다.
const VERSUS: Array<{ label: string; sub: string; ours: string; other: string }> = [
  { label: '굵은 글씨 강조를 살린 곳', sub: '원본에 28곳이 있어요', ours: '28곳', other: '0곳' },
  { label: '두 번 변환한 결과가 같은 정도', sub: '공백을 뺀 글자 기준이에요', ours: '100%', other: '86.9%' },
  { label: '점역 프로그램에서 깨질 수 있는 글머리 문자', sub: '적을수록 좋아요', ours: '0곳', other: '39곳' },
]

// 몇 번째인지 알려 줘서 CSS가 앞의 것이 나온 뒤에 다음 것이 나오게 한다.
const order = (index: number) => ({ '--i': index }) as CSSProperties

// 일 나누기 그림: 절반 넘게 화면에 들어오면 단계가 1번부터 차례로 나타난다. 움직임은 welcome.css의 model-split 규칙이 맡는다.
function SplitGraphic() {
  const [ref, playing] = useInViewOnce<HTMLOListElement>(0.5)

  return (
    <ol ref={ref} className={`model-split ${playing ? 'is-playing' : ''}`} role="list">
      {SPLIT.map(({ who, title, sub }, index) => (
        <li key={title} className={`model-split-step is-${who}`} style={order(index)}>
          <span className="model-split-number" aria-hidden="true">
            {index + 1}
          </span>
          <span className={`model-who ${who === 'ai' ? 'is-ai' : ''}`}>{who === 'ai' ? 'AI' : '코드'}</span>
          <span className="model-split-title">
            <span className="sr-only">{index + 1}단계 </span>
            {title}
          </span>
          <span className="model-split-sub">{sub}</span>
        </li>
      ))}
      {/* 넓은 화면에서 두 줄의 이름표가 된다. 단계마다 'AI'·'코드'가 적혀 있어서 화면 읽기 프로그램에는 숨긴다. */}
      <li className="model-split-lane is-ai" aria-hidden="true">
        <strong>AI가 하는 일</strong>
        <span>판단이 필요한 일</span>
      </li>
      <li className="model-split-lane is-code" aria-hidden="true">
        <strong>코드가 하는 일</strong>
        <span>정답이 정해진 일</span>
      </li>
    </ol>
  )
}

function ModelSection() {
  return (
    <section className="welcome-section" aria-labelledby="welcome-model-title">
      <div className="welcome-section-head">
        <h2 id="welcome-model-title" className="welcome-section-title">
          AI는 판단이 필요한 일에만 써요
        </h2>
        <p className="welcome-section-description">
          정답이 정해진 일은 코드가 하고, 사람의 판단이 필요한 일만 AI가 해요. AI는 본문 글자를 다시 쓰지 않아서 원문 내용이
          바뀌지 않아요.
        </p>
      </div>

      <div className="welcome-story-card">
        <h3 className="welcome-story-card-title">일을 이렇게 나눠요</h3>
        <SplitGraphic />
      </div>

      <h3 className="welcome-story-card-title model-subhead">직접 학습시킨 뒤 설명문이 이렇게 달라졌어요</h3>
      <p className="welcome-story-text model-sublead">
        공개 모델 Qwen3.5-4B에 AI Hub의 차트 자료 5,000건을 추가로 학습시켰어요(LoRA 미세조정). 숫자는 학습 전과 후의
        평가 점수예요.
      </p>
      <ul className="welcome-kpi-grid is-four model-kpi" role="list">
        {KPIS.map(({ label, before, value, note }, index) => (
          <li key={label} className="welcome-kpi">
            <span className="welcome-kpi-label">{label}</span>
            <span className="welcome-kpi-figure">
              <span className="welcome-kpi-before">
                <span className="sr-only">학습 전 </span>
                {before}
              </span>
              <ArrowRightIcon aria-hidden="true" size={20} weight="bold" className="welcome-kpi-arrow" />
              <span className="sr-only">학습 후 </span>
              <span className="welcome-kpi-value">
                <CountUp from={Number(before)} to={value} digits={2} delay={index * 250} />
              </span>
            </span>
            <span className="welcome-kpi-note">{note}</span>
          </li>
        ))}
      </ul>

      <div className="welcome-story-card">
        <h3 className="welcome-story-card-title">범용 AI에 규칙을 알려 주면 대신할 수 있을까요?</h3>
        <p className="welcome-bars-caption">
          범용 AI(Gemini 3.8 Flash)와 BridgeOn에 같은 점역 규칙을 주고, 같은 채점 기준으로 두 번씩 변환했어요. 사회학원론
          PPTX 21쪽의 결과예요.
        </p>
        <table className="model-versus">
          <caption className="sr-only">범용 AI와 BridgeOn의 변환 결과 비교</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">지표</span>
              </th>
              <th scope="col">BridgeOn</th>
              <th scope="col">범용 AI</th>
            </tr>
          </thead>
          <tbody>
            {VERSUS.map(({ label, sub, ours, other }, index) => (
              <tr key={label} style={order(index)}>
                <th scope="row">
                  {label}
                  <span className="model-versus-sub">{sub}</span>
                </th>
                <td className="is-ours">{ours}</td>
                <td>{other}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="welcome-results-note">
          규칙을 프롬프트로 주는 것만으로는 BridgeOn을 대신하기 어려웠어요. BridgeOn은 규칙을 코드로 적용하고 검증기로
          확인해서, 같은 입력에는 같은 결과가 나와요.
        </p>
      </div>

      <p className="welcome-how-note">
        <strong>아직 부족한 점도 있어요.</strong> 복합 차트나 해상도가 낮은 그림에서는 설명이 틀릴 수 있어요. 그래서 결과는
        점역가가 검수하고 고치는 초안이에요.
      </p>

      <ModelDetails />
    </section>
  )
}

export default ModelSection
