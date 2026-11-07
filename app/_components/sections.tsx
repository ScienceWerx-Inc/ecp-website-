import type { SiteContent } from "../_lib/site-content";

/**
 * Data-driven versions of the dynamic home/contact sections, spliced in only
 * when the live MoreWerx content differs from the baseline (see render-page).
 * Markup mirrors the source so live content reuses the exact styles.
 */

const STAT_ICONS = [
  <path key="s" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  <g key="u">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </g>,
  <g key="l">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </g>,
  <g key="a">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </g>,
];

export function Hero({ hero }: { hero: SiteContent["hero"] }) {
  return (
    <section className="hero-bovis">
      <div className="wrap">
        <div className="hero-bovis-content">
          <span className="eyebrow on-dark">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p>{hero.subtitle}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/projects">
              Explore Our Work →
            </a>
            <a className="btn btn-hero-outline" href="/about">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
              Watch Our Story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stats({ stats }: { stats: SiteContent["stats"] }) {
  return (
    <div className="wrap stats-overlap-wrap">
      <div className="stats-overlap-card">
        {stats.map((s, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75">
                {STAT_ICONS[i] ?? STAT_ICONS[0]}
              </svg>
            </div>
            <div className="stat-text">
              <div className="n">{s.value}</div>
              <div className="l">{s.label}</div>
              <p>{s.blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturedProjects({ projects }: { projects: SiteContent["projects"] }) {
  return (
    <div className="proj-grid">
      {projects.map((p, i) => (
        <article className="proj-card" key={i}>
          <div className="proj-media">
            <img src={p.image ? `/${p.image}` : "/spec_wood.jpg"} alt={p.title} />
            <span className="proj-badge">{p.category}</span>
          </div>
          <div className="proj-body">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <a className="proj-link" href="/projects">
              View Project →
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export function Faqs({ faqs }: { faqs: SiteContent["faqs"] }) {
  return (
    <div>
      {faqs.map((f, i) => (
        <details key={i} {...(i === 0 ? { open: true } : {})}>
          <summary>{f.q}</summary>
          <div className="ans">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
