import type { Metadata } from "next";
import { Chrome } from "../_lib/chrome";
import { getPosts, prettyDate } from "../_lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | ECP Engineering",
  description: "Insights, project stories and news from Engineered Construction Products, Ltd.",
};

const FALLBACK_IMAGES = ["/mkt_commercial.jpg", "/spec_wood.jpg", "/mkt_civil.jpg", "/spec_facility.jpg"];

export default async function Blog() {
  const posts = await getPosts();
  return (
    <Chrome active="/blog">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow on-dark">INSIGHTS &amp; NEWS</span>
          <h1>From the ECP team.</h1>
          <p className="lede">
            Project stories, engineering insight and company news from five decades of building across the Mid-Atlantic.
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-soft)" }}>
        <div className="wrap">
          {posts.length === 0 ? (
            <div className="blog-empty">
              <h2>No articles yet.</h2>
              <p>Our first posts are on the way. Check back soon.</p>
            </div>
          ) : (
            <div className="proj-grid">
              {posts.map((p, i) => (
                <article className="proj-card" key={p.slug}>
                  <a className="proj-media" href={`/blog/${encodeURIComponent(p.slug)}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} alt={p.title} />
                    {(p.type || p.tags[0]) && <span className="proj-badge">{p.type || p.tags[0]}</span>}
                  </a>
                  <div className="proj-body">
                    <p className="post-meta">{[prettyDate(p.date), p.readTime].filter(Boolean).join(" · ")}</p>
                    <h3>{p.title}</h3>
                    {p.excerpt && <p>{p.excerpt}</p>}
                    <a className="proj-link" href={`/blog/${encodeURIComponent(p.slug)}`}>
                      Read Article &rarr;
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Chrome>
  );
}
