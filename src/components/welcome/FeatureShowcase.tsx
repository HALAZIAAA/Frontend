import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChatsCircleIcon,
  CheckIcon,
  CircleHalfIcon,
  ColumnsIcon,
  ImageSquareIcon,
  UploadSimpleIcon,
  type Icon,
} from '@phosphor-icons/react'
import { useTabs } from '../../lib/useTabs'
import ConvertDemo from './ConvertDemo'
import DescribeDemo from './DescribeDemo'
import PreviewDemo from './PreviewDemo'
import DisplayDemo from './DisplayDemo'
import CommunityDemo from './CommunityDemo'
import JobsDemo from './JobsDemo'

type FeatureId = 'convert' | 'describe' | 'preview' | 'display' | 'community' | 'jobs'

type Feature = {
  id: FeatureId
  icon: Icon
  label: string
  title: string
  description: string
  points: string[]
  screen: string // 예시 화면 위쪽 막대에 쓰는 화면 이름
  link: { to: string; label: string } | null
}

const FEATURES: Feature[] = [
  {
    id: 'convert',
    icon: UploadSimpleIcon,
    label: '파일 변환',
    title: 'PDF·PPTX를 올리면 DOCX·TXT로',
    description: '강의자료를 올리면 글자를 읽고, 그림과 표는 글로 풀어 쓴 문서로 바꿔요.',
    points: ['최대 100MB까지 올릴 수 있어요', '지금 어느 단계인지와 남은 시간을 알려 줘요', '다른 화면에 다녀와도 진행 상황이 이어져요'],
    screen: '파일 변환',
    link: { to: '/', label: '파일 변환하러 가기' },
  },
  {
    id: 'describe',
    icon: ImageSquareIcon,
    label: '그림·표 설명',
    title: '그림과 표도 글로 읽혀요',
    description: '그래프, 표, 흐름도, 사진까지 무엇이 그려져 있는지 AI가 글로 설명해요. 예시를 바꿔 가며 보세요.',
    points: [
      '설명 앞뒤에 [그림 시작]과 [그림 끝] 표시가 붙어요',
      '표는 칸을 / 로 나눠 한 줄씩 읽을 수 있어요',
      '점역 규칙에 맞춰 제목은 8칸, 본문은 2칸 들여 써요',
    ],
    screen: '변환 결과',
    link: { to: '/', label: '내 자료로 해 보기' },
  },
  {
    id: 'preview',
    icon: ColumnsIcon,
    label: '미리보기',
    title: '원본과 결과를 나란히',
    description: '변환이 끝나면 앞 4페이지를 원본과 변환 결과로 나란히 보여 줘요. 지난 변환도 목록의 미리보기 버튼으로 다시 열 수 있어요.',
    points: ['페이지(슬라이드)마다 넘겨 볼 수 있어요', '원본은 크게 보기로 확대돼요', '받기 전에 결과가 괜찮은지 먼저 확인해요'],
    screen: '변환된 파일 목록',
    link: { to: '/', label: '내 변환 목록 보기' },
  },
  {
    id: 'display',
    icon: CircleHalfIcon,
    label: '화면 설정',
    title: '보기 편한 화면으로',
    description: '고대비 모드와 글자 크기(기본, 크게, 아주 크게)를 고를 수 있어요. 아래 예시에서 직접 바꿔 보세요.',
    points: ['고대비는 글자와 테두리를 진하게 바꿔요', '글자 크기를 바꾸면 화면 전체가 같이 커져요', '본문 바로가기로 메뉴를 건너뛸 수 있어요'],
    screen: '화면 설정',
    link: null,
  },
  {
    id: 'community',
    icon: ChatsCircleIcon,
    label: '커뮤니티',
    title: '묻고 나누는 게시판',
    description: '변환 결과나 점역 작업에 대해 묻고, 공지를 확인해요. 글을 눌러 내용을 펼쳐 보세요.',
    points: ['공지와 질문으로 나눠 볼 수 있어요', '글에 사진을 붙일 수 있어요', '불편한 글은 신고할 수 있어요'],
    screen: '커뮤니티',
    link: { to: '/community', label: '커뮤니티 가기' },
  },
  {
    id: 'jobs',
    icon: BriefcaseIcon,
    label: '채용공고',
    title: '점역·교정 일자리 모아 보기',
    description: '점역·교정사 취업정보 게시판의 공고를 매일 모아 보여 줘요. 공고를 눌러 자세히 보세요.',
    points: ['마감까지 남은 날을 글자로 알려 줘요', '마감이 3일 안이면 눈에 띄게 표시해요', '제목을 누르면 원문이 새 창으로 열려요'],
    screen: '채용공고',
    link: { to: '/jobs', label: '채용공고 보기' },
  },
]

const FEATURE_IDS = FEATURES.map((feature) => feature.id)

function FeatureScreen({ id }: { id: FeatureId }) {
  switch (id) {
    case 'convert':
      return <ConvertDemo />
    case 'describe':
      return <DescribeDemo />
    case 'preview':
      return <PreviewDemo />
    case 'display':
      return <DisplayDemo />
    case 'community':
      return <CommunityDemo />
    case 'jobs':
      return <JobsDemo />
  }
}

function FeatureShowcase() {
  const [selected, setSelected] = useState<FeatureId>('convert')
  const { getTabProps, panelProps } = useTabs({
    idPrefix: 'welcome-feature',
    tabs: FEATURE_IDS,
    selected,
    onSelect: setSelected,
  })
  const feature = FEATURES.find((item) => item.id === selected) ?? FEATURES[0]

  return (
    <section className="welcome-section" aria-labelledby="welcome-features-title">
      <div className="welcome-section-head">
        <h2 id="welcome-features-title" className="welcome-section-title">
          이런 걸 할 수 있어요
        </h2>
        <p className="welcome-section-description">기능을 누르면 화면 예시가 바뀌어요. 예시 안의 버튼도 눌러 보세요.</p>
      </div>

      <div className="welcome-feature-tabs" role="tablist" aria-label="BridgeOn 기능">
        {FEATURES.map(({ id, icon: FeatureIcon, label }, index) => (
          <button key={id} type="button" className="welcome-feature-tab" {...getTabProps(id, index)}>
            <FeatureIcon aria-hidden="true" size={20} />
            {label}
          </button>
        ))}
      </div>

      <div className="welcome-feature-panel" {...panelProps}>
        <div className="welcome-feature-text">
          <h3 className="welcome-feature-title">{feature.title}</h3>
          <p className="welcome-feature-description">{feature.description}</p>
          <ul className="welcome-feature-points" role="list">
            {feature.points.map((point) => (
              <li key={point}>
                <CheckIcon aria-hidden="true" size={18} weight="bold" />
                {point}
              </li>
            ))}
          </ul>
          {feature.link && (
            <Link to={feature.link.to} className="welcome-text-link">
              {feature.link.label}
              <ArrowRightIcon aria-hidden="true" size={18} />
            </Link>
          )}
        </div>

        {/* 예시 화면. 기능을 바꾸면 새로 그려서 예시 안의 상태도 처음으로 돌아간다. */}
        <div className="welcome-screen" role="group" aria-label={`${feature.screen} 화면 예시`}>
          <div className="welcome-screen-bar" aria-hidden="true">
            <span className="welcome-screen-dot" />
            <span className="welcome-screen-dot" />
            <span className="welcome-screen-dot" />
            <span className="welcome-screen-name">{feature.screen}</span>
          </div>
          <div className="welcome-screen-body" key={feature.id}>
            <FeatureScreen id={feature.id} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
