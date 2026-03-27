type HeroSectionProps = {
  title: string
  description: string
}

function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className="home-hero-section" aria-labelledby="home-hero-title">
      <div className="home-hero-content">
        <h1 id="home-hero-title" className="home-hero-title">
          {title}
        </h1>
        <p className="home-hero-description">{description}</p>
      </div>
    </section>
  )
}

export default HeroSection
