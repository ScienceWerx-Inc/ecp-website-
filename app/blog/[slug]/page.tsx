import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chrome } from "../../_lib/chrome";
import { getPost, prettyDate } from "../../_lib/posts";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(decodeURIComponent((await params).slug));
  if (!post) return { title: "Article not found | ECP Engineering" };
  return { title: `${post.title} | ECP Engineering`, description: post.excerpt || undefined };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(decodeURIComponent((await params).slug));
  if (!post) notFound();
  const meta = [prettyDate(post.date), post.readTime, post.author && `By ${post.author}`].filter(Boolean);
  return (
    <Chrome active="/blog">
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow on-dark">{(post.type || "ARTICLE").toUpperCase()}</span>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="lede">{post.excerpt}</p>}
          {meta.length > 0 && (
            <div className="page-hero-meta">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="wrap">
          <article className="post-body">
            {post.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="post-hero-img" src={post.imageUrl} alt={post.title} />
            )}
            {post.blocks.map((b, i) =>
              b.kind === "image" ? (
                <figure key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.url} alt={b.alt} />
                  {b.alt && <figcaption>{b.alt}</figcaption>}
                </figure>
              ) : (
                <p key={i}>{b.text}</p>
              ),
            )}
            {post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
            <a className="proj-link" href="/blog">
              &larr; All articles
            </a>
          </article>
        </div>
      </section>
    </Chrome>
  );
}
