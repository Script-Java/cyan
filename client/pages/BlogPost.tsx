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
        <main className="min-h-screen bg-white py-12">
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-600">Loading blog...</div>
          </div>
        </main>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Blog Post Not Found
              </h1>
              <p className="text-gray-600">{error || "The blog post you are looking for does not exist."}</p>
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

      {/* Featured Image Hero Banner */}
      {blog.featured_image_url && (
        <section className="relative w-full h-96 overflow-hidden bg-gray-900">
          <img
            src={blog.featured_image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(to top, rgba(255, 255, 255, 1) 0px, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%)",
            }}
          />
        </section>
      )}

      <main className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="bg-white pt-12 pb-8">
          <div className="max-w-3xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
              <a href="/" className="hover:text-gray-900 transition-colors">
                Home
              </a>
              <span>/</span>
              <a href="/blogs" className="hover:text-gray-900 transition-colors">
                Blog
              </a>
              <span>/</span>
              <span className="text-gray-900">{blog.title}</span>
            </nav>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views} views</span>
              </div>
              <span>•</span>
              <div className="text-gray-600">
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {blog.featured_image_url && (
          <section className="py-8 bg-white">
            <div className="max-w-3xl mx-auto px-4">
              <img
                src={blog.featured_image_url}
                alt={blog.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <article>
              <div className="text-gray-900 leading-relaxed space-y-6">
                {blog.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {blog.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold">{blog.author}</h3>
                  <p className="text-gray-600 text-sm">
                    Content creator and storyteller
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-gray-600">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ maxWidth: "2026px" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Vinyl Stickers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Holographic
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Chrome
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Glitter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/blogs" className="hover:text-gray-900 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Follow</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    TikTok
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-200">
            <p style={{ fontWeight: "400", fontSize: "12px", color: "rgba(0, 0, 0, 0.5)" }}>
              Built with ❤️ by © Sticky Slap LLC
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
