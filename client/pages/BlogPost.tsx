import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Calendar, User, Eye, ArrowLeft } from "lucide-react";

interface BlogData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  featured_image_url?: string;
  tags: string[];
  created_at: string;
  views: number;
}

export default function BlogPost() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${blogId}`);
        if (!response.ok) {
          throw new Error("Blog not found");
        }
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black py-12">
          <div className="flex justify-center items-center h-96">
            <div className="text-white/60">Loading blog...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black py-12">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Blog Post Not Found
              </h1>
              <p className="text-white/60">{error || "The blog post you are looking for does not exist."}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readTime = Math.ceil(blog.content.split(" ").length / 200);

  return (
    <>
      <Header />
      <main className="bg-gradient-to-b from-black via-blue-950/10 to-black">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-950/30 to-black pt-12 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <a href="/" className="hover:text-white transition-colors">
                Home
              </a>
              <span>/</span>
              <a href="/" className="hover:text-white transition-colors">
                Blog
              </a>
              <span>/</span>
              <span className="text-white">{blog.title}</span>
            </nav>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70 border-b border-white/10 pb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views} views</span>
              </div>
              <div className="text-white/60">
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {blog.featured_image_url && (
          <section className="py-8">
            <div className="max-w-4xl mx-auto px-4">
              <img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full h-96 object-cover rounded-lg border border-white/10"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <article className="prose prose-invert max-w-none">
              <div className="text-white/90 leading-relaxed space-y-6">
                {blog.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t border-white/10 bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {blog.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{blog.author}</h3>
                  <p className="text-white/60 text-sm">
                    Content creator and storyteller
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="py-12 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8">More Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <article
                  key={i}
                  className="group cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all">
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Explore More Articles
                      </h3>
                      <p className="text-white/60 text-sm mt-2">
                        Discover more insights and stories from our blog
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
