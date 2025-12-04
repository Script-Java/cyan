import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Calendar, User, ArrowRight, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: string;
  featured_image_url?: string;
  views: number;
  tags: string[];
}

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Blog
            </h1>
            <p className="text-lg text-white/60">
              Discover tips, tricks, and stories about custom stickers and design inspiration
            </p>
          </div>

          {/* Search */}
          <div className="mb-8 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-white/40" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 pl-10 focus:border-blue-500"
            />
          </div>

          {/* Blog List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-white/60">Loading blogs...</div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">
                {blogs.length === 0
                  ? "No blog posts yet. Check back soon!"
                  : "No posts match your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBlogs.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className="w-full text-left bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/30 hover:bg-white/10 transition-all group"
                >
                  <div className="flex gap-6 p-6">
                    {/* Featured Image */}
                    {blog.featured_image_url && (
                      <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-white/5">
                        <img
                          src={blog.featured_image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {blog.title}
                      </h2>
                      <p className="text-white/70 mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>

                      {/* Tags */}
                      {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(blog.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
