import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Upload, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminSendProof() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploadedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  const handleSendProof = async () => {
    try {
      if (!email) {
        toast.error("Please enter customer email");
        return;
      }

      if (!subject) {
        toast.error("Please enter proof subject");
        return;
      }

      if (!uploadedFile) {
        toast.error("Please upload a design file");
        return;
      }

      setIsSending(true);
      setUploadProgress(0);

      // Step 1: Upload to Cloudinary
      toast.loading("Uploading file to Cloudinary...");
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("upload_preset", "sticky_slap_proofs");

      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dabgothkm/auto/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      setUploadProgress(50);

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload file to Cloudinary");
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const fileUrl = cloudinaryData.secure_url;

      // Step 2: Send proof via backend
      toast.loading("Sending proof to customer...");
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/admin/proofs/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerEmail: email,
          description: subject,
          referenceNumber: referenceNumber || null,
          fileUrl,
          fileName: uploadedFile.name,
        }),
      });

      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send proof");
      }

      toast.success("Proof sent to customer successfully!");

      // Reset form
      setEmail("");
      setSubject("");
      setReferenceNumber("");
      setUploadedFile(null);
      setFilePreview(null);
      setUploadProgress(0);

      // Redirect after a moment
      setTimeout(() => {
        navigate("/admin/proofs");
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send proof";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full pb-20 md:pb-0 px-3 sm:px-6 lg:px-8 pt-6 md:pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/proofs")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Proofs
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Send Design Proof
            </h1>
            <p className="text-gray-600">
              Send a design proof directly to a customer's email
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8">
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                />
                <p className="text-xs text-gray-600 mt-1">
                  The proof will be sent to this email address
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Proof Subject/Title *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., T-Shirt Design Mockup - Front and Back"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                />
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g., Order #12345, Project ID, etc."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Any reference info the customer should see (e.g., order
                  number, project name)
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Upload Design File *
                </label>
                {!uploadedFile ? (
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-500 hover:bg-gray-50 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-700 font-medium">
                        Click to upload design file
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Images or PDF (max 50MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        File Selected
                      </h4>
                      <button
                        onClick={handleRemoveFile}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {filePreview ? (
                      <div>
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full max-h-48 object-cover rounded-lg border border-gray-300 mb-3"
                        />
                        <p className="text-sm text-gray-600">
                          {uploadedFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-300">
                <button
                  onClick={() => navigate("/admin/proofs")}
                  className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium text-sm rounded-xl transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendProof}
                  disabled={isSending || !email || !subject || !uploadedFile}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium text-sm rounded-xl transition-colors"
                >
                  {isSending ? "Sending..." : "Send Proof"}
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-300 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ How it works:</strong> The customer will receive an
              email with the design proof. They can approve it, request changes,
              or add notes. All responses are logged and displayed next to their
              email in the proof records.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
