import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Search,
  ArrowRight,
} from "lucide-react";

interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  created_at: string;
  visibility: "visible" | "hidden";
  views: number;
  show_in_listing?: boolean;
}

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    setIsDeleting(blogId);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }

      setSuccess("Blog post deleted successfully");
      setBlogs(blogs.filter((b) => b.id !== blogId));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete blog");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    Blog Posts
                  </h1>
                  <p className="text-gray-600">
                    Manage your blog posts and content
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/admin/create-blog")}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 focus:border-blue-500"
              />
            </div>

            {/* Blog List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-gray-600">Loading blogs...</div>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blog posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start creating your first blog post
                </p>
                <Button
                  onClick={() => navigate("/admin/create-blog")}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {blog.excerpt}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{blog.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{blog.views} views</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              blog.visibility === "visible"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {blog.visibility === "visible"
                              ? "Published"
                              : "Draft"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              blog.show_in_listing !== false
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {blog.show_in_listing !== false
                              ? "In Listing"
                              : "Hidden from Listing"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/blog/${blog.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
                          title="View blog"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/edit-blog/${blog.id}`)
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          disabled={isDeleting === blog.id}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete blog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Stats */}
            {!isLoading && blogs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {blogs.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Published</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {blogs.filter((b) => b.visibility === "visible").length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {blogs.reduce((sum, b) => sum + b.views, 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
