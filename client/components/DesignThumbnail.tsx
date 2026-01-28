import { Download, FileText, Image as ImageIcon } from "lucide-react";

interface DesignThumbnailProps {
  designFileUrl?: string;
  itemId?: number;
  size?: "small" | "medium" | "large";
}

export default function DesignThumbnail({
  designFileUrl,
  itemId,
  size = "medium",
}: DesignThumbnailProps) {
  if (!designFileUrl) {
    return null;
  }

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const isDataUrl = designFileUrl.startsWith("data:");
  const isImageFile = isDataUrl
    ? designFileUrl.match(/^data:image\/(jpg|jpeg|png|gif|webp)/i)
    : designFileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const handleDownload = () => {
    if (isDataUrl) {
      const link = document.createElement("a");
      link.href = designFileUrl;
      link.download = `design-${itemId || "file"}`;
      link.click();
    } else {
      window.open(designFileUrl, "_blank");
    }
  };

  // Build high-quality download URL with quality parameter
  const getHighQualityUrl = (url: string) => {
    if (url.startsWith("data:")) return url;
    // Add quality parameter for high-quality downloads
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}q=100`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`${sizeClasses[size]} bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center relative group aspect-square`}
      >
        {isImageFile ? (
          <img
            src={designFileUrl}
            alt="Design Upload"
            className="w-full h-full object-contain p-1"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <FileText className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 text-center px-1">File</span>
          </div>
        )}

        {/* Hover overlay for preview */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center gap-1 transition-all opacity-0 group-hover:opacity-100">
          <a
            href={getHighQualityUrl(designFileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-white rounded hover:bg-gray-100 transition-colors"
            title="View full design in high quality"
          >
            <ImageIcon className="w-4 h-4 text-gray-700" />
          </a>
        </div>
      </div>

      {/* Download button */}
      <a
        href={getHighQualityUrl(designFileUrl)}
        download={`design-${itemId || "file"}`}
        className="inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
        title="Download design file in high quality"
      >
        <Download className="w-3 h-3" />
        Download
      </a>
    </div>
  );
}
