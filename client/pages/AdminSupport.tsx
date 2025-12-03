import { useEffect, useState } from "react";
import {
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Send,
  Loader,
  ArrowLeft,
  Filter,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import { toast } from "sonner";

interface AdminTicket {
  id: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  category: string;
  priority: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  sender_name: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(
    null,
  );
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("open");
  const [statsOpen, setStatsOpen] = useState<boolean>(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      // Redirect to home if not admin
      window.location.href = "/";
      return;
    }
    fetchAllTickets();
  }, [filter]);

  const fetchAllTickets = async () => {
    try {
      setIsLoading(true);
      const url = `/api/admin/tickets${filter !== "all" ? `?status=${filter}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data.tickets || []);

      // Count open tickets
      const openCount = (data.tickets || []).filter(
        (t: AdminTicket) => t.status === "open",
      ).length;
      if (openCount > 0) {
        setStatsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    // Fetch ticket details with replies
    try {
      // Create a dummy customer ID for fetching - admin can use 0 to get all replies
      const response = await fetch(
        `/api/support/tickets/${ticket.id}?customerId=0`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }

      const data = await response.json();
      setTicketReplies(data.replies || []);
    } catch (error) {
      console.error("Error loading ticket details:", error);
      toast.error("Failed to load ticket details");
      setTicketReplies([]);
    }
  };

  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSubmittingReply(true);

    try {
      const response = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: replyMessage,
            adminName: "Support Team",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }

      toast.success("Reply sent and customer notified!");
      setReplyMessage("");

      // Add reply to local state
      const newReply: TicketReply = {
        id: Date.now().toString(),
        sender_name: "Support Team",
        sender_type: "admin",
        message: replyMessage,
        created_at: new Date().toISOString(),
      };
      setTicketReplies([...ticketReplies, newReply]);

      // Refresh the ticket (update status)
      setSelectedTicket({ ...selectedTicket, status: "in-progress" });
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setSelectedTicket({ ...selectedTicket, status: newStatus });
      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: newStatus } : t,
        ),
      );
      toast.success("Ticket status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    setTicketReplies([]);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-50 text-red-700 border-red-200",
      "in-progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "text-gray-600",
      medium: "text-blue-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  const getPriorityBg = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100",
      medium: "bg-blue-100",
      high: "bg-orange-100",
      urgent: "bg-red-100",
    };
    return colors[priority] || "bg-gray-100";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedTicket) {
    return (
      <>
        <Header />
        <div className="flex">
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 md:ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12 px-3 sm:px-6 lg:px-8 pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <button
                onClick={handleCloseTicket}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                Back to Tickets
              </button>

              {/* Ticket Details */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {selectedTicket.subject}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600">
                      From:{" "}
                      <span className="font-semibold">
                        {selectedTicket.customer_name}
                      </span>{" "}
                      ({selectedTicket.customer_email})
                    </p>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className={`px-4 py-2 rounded-lg border font-semibold text-sm outline-none ${getStatusColor(selectedTicket.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Ticket Meta Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Priority
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPriorityBg(selectedTicket.priority)} ${getPriorityColor(selectedTicket.priority)}`}
                    >
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTicket.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Created
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(selectedTicket.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Original Message */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Customer Message
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>
                </div>

                {/* Conversation */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Conversation ({ticketReplies.length})
                  </h3>

                  {ticketReplies.length === 0 ? (
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center mb-8">
                      <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-blue-800">
                        No replies yet. Add your response below.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8">
                      {ticketReplies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`rounded-lg p-6 border ${
                            reply.sender_type === "admin"
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {reply.sender_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {reply.sender_type === "admin"
                                  ? "Admin"
                                  : "Customer"}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600">
                              {formatDate(reply.created_at)}
                            </p>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Send Reply
                  </h3>
                  <div className="space-y-4">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your response here..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitReply}
                        disabled={isSubmittingReply || !replyMessage.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmittingReply ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Reply & Notify Customer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <MobileAdminPanel />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex">
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        <main className="flex-1 md:ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12 px-3 sm:px-6 lg:px-8 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
                Support Admin Panel
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm">
                Manage customer support tickets and respond to inquiries
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Open Tickets
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {tickets.filter((t) => t.status === "open").length}
                    </p>
                  </div>
                  <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      In Progress
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {tickets.filter((t) => t.status === "in-progress").length}
                    </p>
                  </div>
                  <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                      Resolved
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {tickets.filter((t) => t.status === "resolved").length}
                    </p>
                  </div>
                  <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 sm:mb-8 flex-wrap">
              {["open", "in-progress", "resolved", "all"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-colors ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status === "all"
                    ? "All Tickets"
                    : status.replace("-", " ").toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tickets List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="text-gray-600 text-sm">Loading tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
                <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No tickets
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  All tickets have been resolved! Great job.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className="w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all text-left hover:border-blue-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 truncate">
                          {ticket.subject}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                          {ticket.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                            {ticket.customer_name}
                          </span>
                          <span className="text-xs text-gray-500 truncate hidden sm:inline">
                            {ticket.customer_email}
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getPriorityBg(ticket.priority)} ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(ticket.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
        <MobileAdminPanel />
      </div>
    </>
  );
}
