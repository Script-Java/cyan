import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight, Eye, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const allTags = Array.from(
    new Set(blogs.flatMap((blog) => blog.tags || []))
  ).sort();

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) =>
        blog.tags.some((blogTag) => blogTag.toLowerCase() === tag.toLowerCase())
      );

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                Recent articles
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Discover insights, tips, and industry updates from our experts
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 pl-12 pr-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base"
                />
              </div>
            </div>
          </div>

          {/* Topic Filters */}
          {allTags.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span>Filter by topics</span>
                {selectedTags.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {selectedTags.length} selected
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={
                      selectedTags.includes(tag) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Blog List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-500">Loading articles...</div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">
                {blogs.length === 0
                  ? "No articles yet"
                  : "No articles match your search"}
              </p>
              <p className="text-gray-500 mb-6">
                {blogs.length === 0
                  ? "Check back soon for new content!"
                  : "Try adjusting your search or filters"}
              </p>
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedTags([])}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-sm text-gray-600 font-medium mb-6">
                Showing {filteredBlogs.length} of {blogs.length} articles
              </div>
              {filteredBlogs.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex gap-6 p-6">
                    {/* Featured Image */}
                    {blog.featured_image_url && (
                      <div className="flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={blog.featured_image_url}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Top Section */}
                      <div>
                        {/* Date and Tags Row */}
                        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">
                              {formatDate(blog.created_at)}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(blog.created_at)}
                            </span>
                          </div>
                          {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              {blog.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {blog.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-600 text-base mb-4 line-clamp-2 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* Bottom Section - Meta Info */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{blog.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
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
