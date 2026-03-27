type FeatureCardProps = {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="feature-card-item">
      <div className="feature-card-content-group">
        <div className="feature-card-icon-box" aria-hidden="true">
          <span className="feature-card-icon-text">{icon}</span>
        </div>
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-description">{description}</p>
      </div>
    </article>
  )
}

export default FeatureCard
