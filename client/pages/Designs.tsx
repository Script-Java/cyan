import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud,
  Download,
  Calendar,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  X,
  Star,
  Eye,
  Share2,
  Trash2,
  DownloadCloud,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileImage,
  Tag,
  SortAsc,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Design {
  id: string;
  name: string;
  url?: string;
  description?: string;
  type: string;
  size?: string;
  createdAt?: string;
  approved?: boolean;
  proofUrl?: string;
  orderId?: number;
  orderDate?: string;
  orderStatus?: string;
}

interface OrderDesigns {
  orderId: number;
  orderDate: string;
  orderStatus: string;
  designs: Design[];
}

interface DesignsResponse {
  success: boolean;
  designs: OrderDesigns[];
  totalOrders: number;
  ordersWithDesigns: number;
}

export default function Designs() {
  const navigate = useNavigate();
  const [designsByOrder, setDesignsByOrder] = useState<OrderDesigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending" | "denied"
  >("all");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem("favoriteDesigns") || "[]")),
  );

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDesigns = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/designs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch designs");
        }

        const data: DesignsResponse = await response.json();
        setDesignsByOrder(data.designs || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load designs";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, [navigate]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "favoriteDesigns",
      JSON.stringify(Array.from(favorites)),
    );
  }, [favorites]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "shipped":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: CheckCircle2,
        };
      case "pending":
      case "processing":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          icon: Clock,
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: FileImage,
        };
    }
  };

  const allDesigns = useMemo(() => {
    return designsByOrder.flatMap((order) =>
      order.designs.map((design) => ({
        ...design,
        orderId: order.orderId,
        orderDate: order.orderDate,
        orderStatus: order.orderStatus,
      })),
    );
  }, [designsByOrder]);

  const filteredDesigns = useMemo(() => {
    let result = allDesigns.filter((design) => {
      const matchesSearch =
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (filterStatus !== "all") {
        if (filterStatus === "approved") {
          matchesStatus = design.approved === true;
        } else if (filterStatus === "pending") {
          matchesStatus = design.approved === false && design.type !== "proof_denied";
        } else if (filterStatus === "denied") {
          matchesStatus = design.type === "proof_denied";
        }
      }

      return matchesSearch && matchesStatus;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime(),
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [allDesigns, searchQuery, sortBy, filterStatus]);

  const totalDesigns = allDesigns.length;
  const approvedDesigns = allDesigns.filter((d) => d.approved).length;

  const toggleFavorite = (designId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(designId)) {
        newFavorites.delete(designId);
      } else {
        newFavorites.add(designId);
      }
      return newFavorites;
    });
  };

  const downloadAllDesigns = () => {
    allDesigns.forEach((design) => {
      if (design.url) {
        const link = document.createElement("a");
        link.href = design.url;
        link.download = design.name || "design";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-8">
              {/* Header Skeleton */}
              <div className="space-y-4">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-64 animate-pulse" />
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-96 animate-pulse" />
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse"
                  />
                ))}
              </div>

              {/* Designs Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const StatusIcon = getStatusColor(
    designsByOrder[0]?.orderStatus || "pending",
  ).icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-10">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Design Library
                  </h1>
                  <Zap className="w-8 h-8 text-amber-500 flex-shrink-0" />
                </div>
                <p className="text-gray-600 text-lg">
                  {totalDesigns > 0
                    ? "Organize, preview, and manage all your design files with approval status tracking"
                    : "Your design library is ready for your first order"}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            {totalDesigns > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Total Designs
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {totalDesigns}
                      </p>
                    </div>
                    <FileImage className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Orders
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {designsByOrder.length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-emerald-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Approved
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {approvedDesigns}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Favorites
                      </p>
                      <p className="text-3xl font-bold text-amber-600">
                        {favorites.size}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-amber-500 opacity-20 fill-current" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {totalDesigns === 0 && !error && (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-6">
                <Cloud className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Designs Yet
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Once you upload designs with an order, they'll appear here.
                Start creating your first design order today!
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 rounded-lg font-medium transition-all"
              >
                Create Your First Order
              </Button>
            </div>
          )}

          {/* Controls and Filters */}
          {totalDesigns > 0 && (
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search designs by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              {/* Filter and View Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  {/* Filter by Status */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                    <Filter className="w-5 h-5 text-gray-400 ml-3" />
                    <select
                      value={filterStatus}
                      onChange={(e) =>
                        setFilterStatus(
                          e.target.value as "all" | "approved" | "pending" | "denied",
                        )
                      }
                      className="px-3 py-2 text-sm font-medium border-0 focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">��� Approved</option>
                      <option value="pending">⏱ Pending</option>
                      <option value="denied">✕ Denied</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
                    <SortAsc className="w-5 h-5 text-gray-400 ml-3" />
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as "newest" | "oldest" | "name",
                        )
                      }
                      className="px-3 py-2 text-sm font-medium border-0 focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">By Name</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-all ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title="Grid view"
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-all ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      title="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Download All */}
                  <button
                    onClick={downloadAllDesigns}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                    title="Download all designs"
                  >
                    <DownloadCloud className="w-5 h-5" />
                    <span className="hidden sm:inline">Download All</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredDesigns.length === 0 && totalDesigns > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No designs found
              </h2>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          )}

          {/* Designs Grid/List View */}
          {filteredDesigns.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDesigns.map((design) => (
                <div
                  key={design.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 h-48 overflow-hidden flex items-center justify-center">
                    {design.url ? (
                      <>
                        <img
                          src={design.url}
                          alt={design.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                      </>
                    ) : (
                      <Cloud className="w-16 h-16 text-gray-300" />
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setSelectedDesign(design)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </button>
                      {design.url && (
                        <a
                          href={design.url}
                          download={design.name}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-gray-700" />
                        </a>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {design.type === "proof" && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-lg">
                          Proof
                        </span>
                      )}
                      {design.approved && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {favorites.has(design.id) && (
                        <span className="p-2 bg-amber-500 text-white rounded-lg">
                          <Star className="w-4 h-4 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                      {design.name}
                    </h3>
                    {design.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {design.description}
                      </p>
                    )}

                    {design.createdAt && (
                      <p className="text-xs text-gray-500 mb-3">
                        {formatDate(design.createdAt)}
                      </p>
                    )}

                    {design.size && (
                      <p className="text-xs text-gray-600 mb-3">
                        Size: {design.size}
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => toggleFavorite(design.id)}
                        className="flex-1 p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        title={
                          favorites.has(design.id)
                            ? "Remove favorite"
                            : "Add favorite"
                        }
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.has(design.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedDesign(design)}
                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Designs List View */}
          {filteredDesigns.length > 0 && viewMode === "list" && (
            <div className="space-y-3">
              {filteredDesigns.map((design) => (
                <div
                  key={design.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {design.url ? (
                        <img
                          src={design.url}
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Cloud className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {design.name}
                        </h4>
                        {design.type === "proof" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg flex-shrink-0">
                            Proof
                          </span>
                        )}
                        {design.approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                      </div>
                      {design.description && (
                        <p className="text-xs text-gray-600 mb-1 truncate">
                          {design.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Order #{design.orderId} •{" "}
                        {formatDate(design.createdAt || "")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleFavorite(design.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.has(design.id)
                          ? "bg-amber-50 text-amber-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.has(design.id) ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => setSelectedDesign(design)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {design.url && (
                      <a
                        href={design.url}
                        download={design.name}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Design Detail Modal */}
      <Dialog
        open={!!selectedDesign}
        onOpenChange={() => setSelectedDesign(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedDesign && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">
                      {selectedDesign.name}
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      {formatDate(selectedDesign.createdAt || "")}
                    </DialogDescription>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Order Number
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      #{selectedDesign.orderId}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Preview */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden flex items-center justify-center min-h-96">
                  {selectedDesign.url ? (
                    <img
                      src={selectedDesign.url}
                      alt={selectedDesign.name}
                      className="max-w-full max-h-full object-contain p-4"
                    />
                  ) : (
                    <Cloud className="w-24 h-24 text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Order
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      #{selectedDesign.orderId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Date
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedDesign.orderDate || "")}
                    </p>
                  </div>

                  {selectedDesign.description && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedDesign.description}
                      </p>
                    </div>
                  )}

                  {selectedDesign.size && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Size
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedDesign.size}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Type
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 capitalize">
                        {selectedDesign.type === "proof"
                          ? "Design Proof"
                          : "Uploaded Design"}
                      </p>
                      {selectedDesign.type === "proof" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                          Proof
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Status
                    </p>
                    {selectedDesign.approved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    ) : selectedDesign.type === "proof" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg">
                        <Clock className="w-3 h-3" />
                        Awaiting Approval
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg">
                        Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleFavorite(selectedDesign.id)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      favorites.has(selectedDesign.id)
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        favorites.has(selectedDesign.id) ? "fill-current" : ""
                      }`}
                    />
                    {favorites.has(selectedDesign.id)
                      ? "Favorited"
                      : "Add to Favorites"}
                  </button>

                  {selectedDesign.url && (
                    <a
                      href={selectedDesign.url}
                      download={selectedDesign.name}
                      className="flex-1 py-2 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
