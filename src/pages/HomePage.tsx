import Navbar from '../components/layout/Navbar'
import FeatureCard from '../components/home/FeatureCard'
import HeroSection from '../components/home/HeroSection'
import UploadSection from '../components/home/UploadSection'
import '../styles/navbar.css'
import '../styles/home.css'
import '../styles/feature-card.css'

const featureItems = [
  {
    icon: '⤴',
    title: '빠른 업로드',
    description: '드래그 앤 드롭으로 간편하게 파일을 업로드하세요.',
  },
  {
    icon: '📄',
    title: '다양한 형식 지원',
    description: 'PDF, 이미지, 문서 등 다양한 형식을 지원합니다.',
  },
  {
    icon: '⬇',
    title: '즉시 다운로드',
    description: '변환 완료 후 바로 다운로드할 수 있습니다.',
  },
]

function HomePage() {
  return (
    <div className="homepage-wrapper">
      <Navbar menuItems={['파일 변환', '커뮤니티']} />

      <main className="home-main-content">
        <HeroSection
          title="간편한 파일 변환 서비스"
          description="다양한 형식의 파일을 빠르고 안전하게 변환하세요"
        />

        <UploadSection />

        <section className="feature-section" aria-label="서비스 주요 기능">
          <div className="feature-grid-container">
            {featureItems.map((featureItem) => (
              <FeatureCard
                key={featureItem.title}
                icon={featureItem.icon}
                title={featureItem.title}
                description={featureItem.description}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
