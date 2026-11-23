import { useRef, useState, type ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import MorePanel from './MorePanel'

// AI 모델의 자세한 내용. 길어서 줄마다 접어 두고, 누르면 펼쳐진다. (만들어 온 과정의 연표와 같은 방식)
// 내용은 졸업작품 산출물(팀 4-01, 2026-11-18 저장본)에서 옮겼다. 묶음마다 어느 문서의 어느 곳인지 적어 둔다.
// 숫자를 고칠 때는 그 문서와 다시 맞춘다. 학습에 걸린 시간은 사용자 요청으로 적지 않는다.
// 표는 좁은 화면에서도 좌우로 밀지 않고 보이게 칸 수를 줄이고 줄바꿈을 허용했다(welcome.css의 .welcome-table.is-fit).

// ── AI와 코드가 맡은 일: 프로젝트 관리 계획서(Doc-002) 2.3.1절과 표 2-1 ──
const STAGES: Array<{ stage: string; who: 'AI' | '코드'; text: string }> = [
  {
    stage: '원본 파일 읽기',
    who: '코드',
    text: 'PDF·PPTX 원본에서 글자, 굵게·형광펜 강조, 제목 단계, 표, 쪽 번호를 직접 읽어요. PyMuPDF와 python-pptx를 써요.',
  },
  {
    stage: '이미지 속 글자 읽기',
    who: 'AI',
    text: '스캔 PDF나 그림 안의 글자처럼 원본 파일에서 바로 읽을 수 없는 글자를 인식해요.',
  },
  { stage: '그림·표 설명 쓰기', who: 'AI', text: '그림·표·그래프·도형의 설명문 초안을 써요.' },
  {
    stage: '문서 구조 판단',
    who: 'AI',
    text: '원본 페이지 배치를 보고 제목 단계, 읽는 순서, 쪽마다 되풀이되는 제목, 장식 그림, 앞 쪽에서 이어지는 표만 판단해요. 본문 글자는 다시 쓰지 않아요.',
  },
  {
    stage: '점역 규칙 적용',
    who: '코드',
    text: '제목은 8·6·5·4칸, 본문은 2칸 들여 쓰고, 쪽 표시(@@p)와 표·그림 경계 표시를 넣어요.',
  },
  {
    stage: '형식 검사',
    who: '코드',
    text: '원문이 바뀌었거나 결과가 비어 있으면 파일을 만들지 않아요. 형식 위반은 경고로 표시해요.',
  },
]

// ── 모델을 고른 이유: 관리 계획서 2.3.2절 ──
const REASONS: Array<{ title: string; text: string }> = [
  {
    title: '자료를 밖으로 보내지 않아요',
    text: '공개 모델이라 팀이 운영하는 GPU 서버에 직접 올려요. 저작권이 있는 강의자료 그림을 외부 AI 서비스로 보내지 않아요.',
  },
  { title: '문서를 읽는 기능이 있어요', text: '문서 이해, 글자 인식(OCR), 표·차트 해석을 지원해요.' },
  { title: '출력을 맞출 수 있어요', text: 'LoRA 미세조정으로 점역용 설명문 형식에 맞게 출력을 조정할 수 있어요.' },
  { title: '구조 판단도 같은 모델이 해요', text: '페이지 그림의 배치를 직접 보고 읽는 순서를 판단해요.' },
]

// ── 학습·평가 자료: 관리 계획서 2.3.3절과 표 2-2 ──
// 표 2-2와 본문에는 시스템 비교용 강의자료가 5종으로, 그림 2-1에는 2종으로 적혀 있어서 몇 종인지는 적지 않았다.
const DATA: Array<{ name: string; value: string }> = [
  { name: '학습 자료', value: 'AI Hub의 차트 이미지-텍스트 쌍 5,000건이에요.' },
  { name: '검증 자료', value: '같은 출처의 500건이에요. 학습 자료와 겹치지 않아요.' },
  {
    name: '시스템 비교 자료',
    value: '실제 강의자료예요. 조직심리학 스캔 PDF 20쪽, 사회학원론 PPTX 21쪽처럼 스캔 문서와 원본 슬라이드 파일을 모두 넣었어요.',
  },
]

// ── 학습 설정: 관리 계획서 2.3.4절과 표 2-3 ──
const SETTINGS: Array<{ name: string; value: string }> = [
  { name: '바탕 모델', value: 'Qwen/Qwen3.5-4B' },
  { name: '학습 방식', value: 'LoRA 미세조정' },
  { name: 'LoRA rank / alpha / dropout', value: '8 / 16 / 0' },
  {
    name: '학습률 / epoch / batch size',
    value: '0.0001 / 1 / 1 (기울기를 8회 누적해 batch size 8과 같은 효과를 냈어요)',
  },
  { name: 'temperature', value: '0 (가장 확률이 높은 출력만 고르는 greedy 방식이에요)' },
  { name: '최대 출력 토큰', value: '그림 설명 512~1,536, 글자 판독 3,072' },
  { name: '학습·추론 환경', value: '학습은 RTX 5080, 추론은 RunPod GPU 서버' },
]

// ── 평가 지표와 모델별 결과: 관리 계획서 2.3.5절의 표 2-4, 표 2-5, 표 2-6 ──
const METRICS: Array<{ name: string; question: string; how: string; range: string }> = [
  {
    name: '정확도',
    question: '정답 설명문의 핵심 정보를 맞게 말했는가',
    how: '맞게 말한 핵심 키워드 수 ÷ 전체 핵심 키워드 수',
    range: '0~1, 높을수록 좋아요',
  },
  {
    name: '완전성',
    question: '핵심 요소를 빠짐없이 말했는가',
    how: '충족한 체크리스트 항목 수 ÷ 전체 항목 수',
    range: '0~1, 높을수록 좋아요',
  },
  {
    name: '언어 적절성',
    question: '문장이 자연스럽고 이해하기 쉬운가',
    how: '1~5점 척도로 채점',
    range: '1~5, 높을수록 좋아요',
  },
  {
    name: '오해율',
    question: '틀린 정보나 그림에 없는 내용을 말했는가',
    how: '오류 개수 × 0.5',
    range: '0 이상, 낮을수록 좋아요',
  },
]

// scores는 METRICS와 같은 순서(정확도, 완전성, 언어 적절성, 오해율)다.
// 좁은 화면에서도 표가 넘치지 않게 모델 이름을 줄여 적고, 무슨 뜻인지는 표 아래에 풀어 쓴다.
const MODELS: Array<{ name: string; scores: string[]; ours?: boolean }> = [
  { name: 'Varco-Vision', scores: ['0.4562', '0.5034', '3.12', '2.99'] },
  { name: 'Qwen 기본', scores: ['0.5225', '0.5143', '3.08', '2.595'] },
  { name: 'Qwen + LoRA', scores: ['0.762', '0.79', '4.33', '1.35'], ours: true },
]

// ── 범용 AI와의 비교: 관리 계획서 2.3.5절 (2)·(3)과 그림 2-1(2026-10-20 진행 보고) ──
// 숫자는 사회학원론 PPTX 21쪽 기준이고, 범용 AI(Gemini 3.8 Flash)는 두 번 실행한 값이다.
const COMPARE: Array<{ metric: string; basis: string; ours: string; other: string; problem: string }> = [
  {
    metric: '굵은 글씨 강조 반영',
    basis: '원본 28곳',
    ours: '28곳',
    other: '0곳',
    problem: '범용 AI는 굵은 글씨를 한 곳도 강조로 옮기지 못했어요.',
  },
  {
    metric: '깨질 수 있는 글머리 문자',
    basis: '점역 프로그램 기준',
    ours: '0곳',
    other: '39곳',
    problem: '범용 AI는 PDF 속 특수 글꼴(Wingdings) 기호를 두 번 모두 그대로 남겼어요.',
  },
  {
    metric: '두 번 변환한 결과의 일치율',
    basis: '공백을 뺀 글자 기준',
    ours: '100%',
    other: '86.9%',
    problem: '범용 AI는 실행할 때마다 되풀이되는 제목의 처리와 그림 묶음 수가 달라졌어요.',
  },
  {
    metric: '그림 설명 블록',
    basis: '원본 그림 16개',
    ours: '16개',
    other: '11~15개',
    problem: '범용 AI는 여러 그림을 하나로 묶어 냈어요. 첫 번째는 11개, 두 번째는 15개였어요.',
  },
  {
    metric: '자동 형식 검사 위반',
    basis: '들여쓰기·경계 등',
    ours: '0건',
    other: '0~4건',
    problem: '범용 AI는 같은 파일인데 첫 번째는 0건, 두 번째는 4건이었어요.',
  },
]

const CAUSES: Array<{ who: string; text: string; ours?: boolean }> = [
  {
    who: '범용 AI',
    text: '판독, 서식 해석, 규칙 적용을 한 번에 해요. 규칙을 지키는지는 프롬프트에만 달려 있고 검증 단계가 없어요. 그래서 위반이 그대로 남고, 실행할 때마다 결과가 달라져요.',
  },
  {
    who: 'BridgeOn',
    text: '원본 파일의 서식 정보를 코드로 직접 읽고, 규칙을 코드로 적용하고, 검증기로 위반을 걸러요. 그래서 같은 입력에는 항상 같은 결과가 나와요.',
    ours: true,
  },
]

const USE_DIFFS: Array<{ topic: string; other: string; ours: string }> = [
  {
    topic: '입력 파일',
    other: 'API가 PPTX를 받지 않아 PDF로 바꿔 넣어야 해요. 이때 서식 정보가 사라져요.',
    ours: 'PPTX를 그대로 읽고, 파일 안의 서식 정보를 직접 가져와요.',
  },
  {
    topic: '점역 규칙 관리',
    other: '점역가마다 프롬프트를 직접 쓰고 고쳐야 해요.',
    ours: '규칙이 프로그램에 고정돼 있어 파일만 넣으면 돼요. 모든 점역가가 같은 기준의 원고를 받아요.',
  },
  {
    topic: '긴 자료',
    other: '한 번에 낼 수 있는 출력이 65,536토큰까지라 긴 자료를 한 번에 옮기기 어려워요.',
    ours: '원문 글자를 99.8% 이상 보존했고, 41쪽 모두 쪽 표시가 맞았어요.',
  },
]

// ── 실제 강의자료 시험: 소프트웨어 시스템 시험 결과서(Doc-007)의 AI 시험(2026-11-16) ──
const TEST_RESULTS = [
  '사회학원론 PPTX(21슬라이드)의 기준 텍스트 2,824자가 빠지거나 바뀐 글자 없이 초안에 들어갔어요.',
  '글자가 그림으로 들어 있는 조직심리학 PDF(20쪽)의 기준 텍스트 5,092자가 틀린 글자 없이 초안에 들어갔어요.',
  '쪽 표시(@@p)는 20개 가운데 20개가 맞게 들어갔고, 들여쓰기 위반은 0건이었어요.',
  '원본의 굵은 글씨 강조 28곳이 모두 남았고, 원본에 없는 강조는 생기지 않았어요.',
  '같은 파일을 두 번 변환한 TXT 원고가 서로 같았어요. PDF는 글자 인식도 매번 새로 했어요.',
  '그림 16개와 도식 1개에 설명문 초안이 만들어졌어요. 팀원이 원본과 대조했을 때 원본에 없는 내용은 들어가지 않았어요.',
]

// 이름과 값을 나란히 적는 목록
function Spec({ rows }: { rows: Array<{ name: string; value: ReactNode }> }) {
  return (
    <dl className="welcome-spec">
      {rows.map(({ name, value }) => (
        <div key={name} className="welcome-spec-row">
          <dt>{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Fold({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <li>
      <details className="welcome-fold">
        <summary className="welcome-fold-summary">
          <span className="welcome-fold-title">{title}</span>
          <span className="welcome-fold-hint">{hint}</span>
          <CaretDownIcon aria-hidden="true" size={18} className="welcome-fold-caret" />
        </summary>
        <div className="welcome-fold-body">{children}</div>
      </details>
    </li>
  )
}

// 자세한 설명 일곱 줄
function FoldList() {
  const listRef = useRef<HTMLUListElement>(null)
  const [allOpen, setAllOpen] = useState(false)

  // 줄마다 따로 여닫을 수 있어서, '모두 펼치기'는 화면에 있는 줄을 직접 한꺼번에 여닫는다.
  const toggleAll = () => {
    const next = !allOpen
    listRef.current?.querySelectorAll('details').forEach((row) => {
      row.open = next
    })
    setAllOpen(next)
  }

  return (
    <>
      <div className="welcome-folds-head">
        <h3 className="welcome-story-card-title">궁금한 것부터 펼쳐 보세요</h3>
        <button type="button" className="demo-ghost-button" onClick={toggleAll}>
          {allOpen ? '모두 접기' : '모두 펼치기'}
        </button>
      </div>

      <ul className="welcome-fold-list" role="list" ref={listRef}>
        <Fold title="AI와 코드가 맡은 일" hint="정답이 정해진 일은 코드가, 판단이 필요한 일은 AI가 해요.">
          <Spec
            rows={STAGES.map(({ stage, who, text }) => ({
              name: stage,
              value: (
                <>
                  <span className={`model-who ${who === 'AI' ? 'is-ai' : ''}`}>{who}</span> {text}
                </>
              ),
            }))}
          />
          <p className="welcome-fold-note">
            AI는 본문 글자를 다시 쓰지 않아요. 그래서 원문 내용이 AI 때문에 바뀌지 않아요.
          </p>
        </Fold>

        <Fold title="Qwen3.5-4B를 고른 이유" hint="처음에 쓰던 Varco-Vision에서 바꿨어요.">
          <p className="welcome-fold-text">
            처음 실험에서는 Varco-Vision을 썼어요. 같은 평가 자료로 견줬더니 Qwen3.5-4B(기본)가 정확도는 더 높고 오해율은
            더 낮아서 모델을 바꿨어요.
          </p>
          <ul className="welcome-tile-grid is-four" role="list">
            {REASONS.map(({ title, text }) => (
              <li key={title} className="welcome-tile">
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </Fold>

        <Fold title="무엇으로 학습시켰나요" hint="AI Hub의 차트 자료 5,000건이에요.">
          <p className="welcome-fold-text">
            강의자료의 시각자료 가운데 설명을 쓰기가 가장 어렵고 오류가 가장 많은 유형이 그래프예요. 그래서 차트 자료로
            학습시켰어요.
          </p>
          <Spec rows={DATA} />
        </Fold>

        <Fold title="어떻게 학습시켰나요" hint="모델 전체가 아니라 일부만 덧붙여 학습시키는 방식(LoRA)을 썼어요.">
          <Spec rows={SETTINGS} />
          <p className="welcome-fold-note">
            temperature를 0으로 뒀기 때문에 같은 입력에는 항상 같은 결과가 나와요.
          </p>
        </Fold>

        <Fold title="어떻게 평가했나요" hint="설명문을 네 가지 지표로 채점했어요.">
          <p className="welcome-fold-text">
            채점은 Gemini 3.8 Flash로 자동화했어요. 차트 그림, 정답 설명문, 모델이 쓴 설명문을 넣으면 네 가지 점수가
            나와요. 사람이 채점할 때 걸리는 시간과, 평가자마다 기준이 달라지는 문제를 줄이려고 이렇게 했어요.
          </p>
          <ul className="welcome-tile-grid is-four" role="list">
            {METRICS.map(({ name, question, how, range }) => (
              <li key={name} className="welcome-tile">
                <strong>{name}</strong>
                <span>{question}</span>
                <span>{how}</span>
                <span className="welcome-tile-stage">{range}</span>
              </li>
            ))}
          </ul>

          <h4 className="welcome-fold-subtitle">모델별 결과</h4>
          <table className="welcome-table is-fit">
            <caption className="sr-only">모델별 설명문 평가 결과</caption>
            <thead>
              <tr>
                <th scope="col">지표</th>
                {MODELS.map(({ name }) => (
                  <th key={name} scope="col">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ name }, index) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  {MODELS.map(({ name: model, scores, ours }) => (
                    <td key={model} className={ours ? 'is-passed' : undefined}>
                      {scores[index]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="welcome-fold-note">
            Varco-Vision은 처음에 쓰던 모델이에요. Qwen 기본은 추가 학습 전의 Qwen3.5-4B, Qwen + LoRA는 추가 학습 후의
            모델이에요.
          </p>
          <p className="welcome-fold-note">
            언어 적절성은 3점이 &lsquo;전반적으로 이해할 수 있으나 일부 어색한 부분이 있다&rsquo;, 4점이 &lsquo;자연스러운
            한국어로, 강의자료 설명으로 바로 쓸 수 있다&rsquo;예요.
          </p>
        </Fold>

        <Fold title="범용 AI와 어떻게 달랐나요" hint="같은 규칙과 같은 채점 기준으로 두 번씩 변환했어요.">
          <p className="welcome-fold-text">
            &lsquo;점역 규칙을 프롬프트로 주면 범용 AI로 BridgeOn을 대신할 수 있는가&rsquo;를 확인했어요. 범용 AI(Gemini 3.8
            Flash)와 BridgeOn에 같은 규칙을 주고, 같은 채점 스크립트로 두 번씩 변환했어요. 아래는 사회학원론 PPTX 21쪽의
            결과예요.
          </p>
          <table className="welcome-table is-fit">
            <caption className="sr-only">범용 AI와 BridgeOn의 점역 원고 비교</caption>
            <thead>
              <tr>
                <th scope="col">지표</th>
                <th scope="col">BridgeOn</th>
                <th scope="col">범용 AI</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(({ metric, basis, ours, other, problem }) => (
                <tr key={metric}>
                  <th scope="row" className="is-plain">
                    <strong>{metric}</strong> ({basis})<span className="welcome-table-sub">{problem}</span>
                  </th>
                  <td className="is-passed">{ours}</td>
                  <td>{other}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="welcome-fold-note">
            조직심리학 스캔 PDF 20쪽에서는 쪽 표시(20/20), 형식 검사 위반(0건), 글머리 문자(0곳), 그림 블록(1개)이 두 방식
            모두 같았어요. 두 번 변환한 결과의 일치율은 BridgeOn 100%, 범용 AI 99.9%였어요.
          </p>

          <h4 className="welcome-fold-subtitle">차이가 생긴 까닭</h4>
          <ul className="welcome-tile-grid is-two" role="list">
            {CAUSES.map(({ who, text, ours }) => (
              <li key={who} className={`welcome-tile ${ours ? 'is-ours' : ''}`}>
                <strong>{who}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <h4 className="welcome-fold-subtitle">쓰는 쪽에서 달라지는 점</h4>
          <Spec
            rows={USE_DIFFS.map(({ topic, other, ours }) => ({
              name: topic,
              value: (
                <>
                  <strong>범용 AI</strong> {other}
                  <br />
                  <strong>BridgeOn</strong> {ours}
                </>
              ),
            }))}
          />
          <p className="welcome-fold-note">
            사용자 테스트 참여자도 범용 AI는 중간 내용을 빠뜨리고 변환한다는 의견을 줬어요.
          </p>
        </Fold>

        <Fold title="실제 강의자료로 시험한 결과" hint="2026년 11월 16일에 강의자료 두 가지를 두 번씩 변환했어요.">
          <p className="welcome-fold-text">
            시험용 PC에서 AI 서버와 백엔드를 실행하고, 결과 원고를 기준 텍스트와 견줬어요. AI 서버에는 Qwen3.5-4B에
            미세조정 어댑터를 붙였어요.
          </p>
          <ul className="welcome-fold-list-plain">
            {TEST_RESULTS.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </Fold>
      </ul>
    </>
  )
}

// 소개 화면이 길어지지 않게, 자세한 설명은 파란 버튼을 눌렀을 때만 보여 준다.
function ModelDetails() {
  return (
    <MorePanel
      label="모델과 평가를 자세히 보기"
      hint="모델을 고른 이유, 학습 자료와 설정, 평가 방법, 범용 AI와 견준 조건을 일곱 가지로 나눠 담았어요."
    >
      <FoldList />
    </MorePanel>
  )
}

export default ModelDetails
