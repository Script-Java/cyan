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
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 pt-10">
              Recent articles
            </h1>
          </div>

          {/* Search */}
          <div className="mb-8 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Blog List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-500">Loading blogs...</div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {blogs.length === 0
                  ? "No blog posts yet. Check back soon!"
                  : "No posts match your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className="w-full text-left bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-5 p-6">
                    {/* Featured Image */}
                    {blog.featured_image_url && (
                      <div className="flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={blog.featured_image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {/* Category and Date */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap gap-3">
                          {blog.tags.length > 0 && (
                            <span className="text-sm font-bold text-red-600">
                              {blog.tags[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {new Date(blog.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-base mb-3 line-clamp-2 flex-grow">
                        {blog.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{blog.author}</span>
                        </div>
                        <span>
                          {new Date(blog.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views} views</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center text-gray-800 group-hover:text-gray-600 transition-colors">
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
