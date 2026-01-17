import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  order_index: number;
  is_active: boolean;
}

export default function AdminGallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state for new image
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    image_alt: "",
  });

  const fetchGalleryImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/gallery/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch gallery images");

      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a URL-based approach
    // In production, you'd upload to Cloudinary or similar
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;

      // Here you would upload to Cloudinary
      // For demo, we'll use the data URL
      setFormData((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = async () => {
    if (!formData.title || !formData.image_url) {
      toast.error("Please fill in title and upload an image");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/gallery/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          order_index: images.length,
        }),
      });

      if (!res.ok) throw new Error("Failed to add gallery image");

      const newImage = await res.json();
      setImages([...images, newImage]);
      setFormData({
        title: "",
        description: "",
        image_url: "",
        image_alt: "",
      });
      toast.success("Image added successfully!");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete image");

      setImages(images.filter((img) => img.id !== id));
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update image");

      const updated = await res.json();
      setImages(images.map((img) => (img.id === id ? updated : img)));
      toast.success("Image updated successfully!");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    }
  };

  const handleToggleActive = (image: GalleryImage) => {
    handleUpdateImage(image.id, { is_active: !image.is_active });
  };

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gallery Management</h1>
          <p className="text-gray-600">
            Manage the featured gallery collection on your home page
          </p>
        </div>

        {/* Add New Image Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Image</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Artist of the Month"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description for the gallery item"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Image Alt Text *
              </label>
              <Input
                type="text"
                value={formData.image_alt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image_alt: e.target.value }))
                }
                placeholder="Describe the image for accessibility"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </label>
              </div>
              {formData.image_url && (
                <div className="mt-4">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleAddImage}
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {uploading ? "Uploading..." : "Add to Gallery"}
            </Button>
          </div>
        </div>

        {/* Current Gallery Images */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Current Gallery ({images.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading gallery images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No gallery images yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.image_url}
                    alt={image.image_alt}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-2">{image.title}</h3>
                    {image.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {image.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(image)}
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          image.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {image.is_active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
