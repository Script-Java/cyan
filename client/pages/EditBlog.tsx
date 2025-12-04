import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  Save,
  Eye,
} from "lucide-react";

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  featured_image_url?: string;
  tags: string[];
  visibility: "visible" | "hidden";
}

export default function EditBlog() {
  const navigate = useNavigate();
  const { blogId } = useParams<{ blogId: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    content: "",
    excerpt: "",
    author: "Arlington Teheran",
    tags: [],
    visibility: "visible",
  });
  const [currentTag, setCurrentTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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
    fetchBlog();
  }, [navigate, blogId]);

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Blog not found");
      }

      const blog = await response.json();
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        author: blog.author,
        featured_image_url: blog.featured_image_url,
        tags: blog.tags || [],
        visibility: blog.visibility,
      });

      if (blog.featured_image_url) {
        setImagePreview(blog.featured_image_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch blog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()],
      });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      content: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Blog title is required");
      return false;
    }
    if (!formData.content.trim()) {
      setError("Blog content is required");
      return false;
    }
    if (!formData.excerpt.trim()) {
      setError("Blog excerpt is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      let imageUrl = formData.featured_image_url;

      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);

        const uploadResponse = await fetch("/api/admin/upload-image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataImage,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          featured_image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }

      setSuccess("Blog post updated successfully!");

      setTimeout(() => {
        navigate("/admin/blogs");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-white/60">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin/blogs")}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blogs
            </button>
            <h1 className="text-3xl font-bold text-white">Edit Blog</h1>
            <p className="text-white/60 mt-1">
              Update your blog post
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Title *
              </label>
              <Input
                type="text"
                placeholder="e.g., Blog about your latest products or deals"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            {/* Content */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Content *
              </label>
              <p className="text-xs text-white/50 mb-3">
                Write your blog post content here
              </p>
              <Textarea
                placeholder="Start writing your blog content here..."
                value={formData.content}
                onChange={handleContentChange}
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500 min-h-96 font-mono text-sm"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Excerpt *
              </label>
              <p className="text-xs text-white/50 mb-3">
                Add a summary of the post to appear on your blog listing
              </p>
              <Textarea
                placeholder="Brief summary of the post..."
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500 min-h-20"
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Featured Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div
                    className="w-full h-64 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden"
                    onClick={() =>
                      document.getElementById("image-input")?.click()
                    }
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-64 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() =>
                      document.getElementById("image-input")?.click()
                    }
                  >
                    <ImageIcon className="w-12 h-12 text-white/40 mb-2" />
                    <p className="text-white/60 text-sm">
                      Click to upload image
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Author */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Author
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            {/* Tags */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add a tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="visible"
                    checked={formData.visibility === "visible"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Published (Visible)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="hidden"
                    checked={formData.visibility === "hidden"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">Draft (Hidden)</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={() => navigate("/admin/blogs")}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Update Blog"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
}
