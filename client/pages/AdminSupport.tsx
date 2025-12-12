import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import MobileAdminPanel from "@/components/MobileAdminPanel";

interface SupportTicket {
  id: number;
  subject: string;
  customer_name: string;
  customer_email: string;
  message: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  category: string;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: number;
  message: string;
  sender_name: string;
  sender_type: "admin" | "customer";
  created_at: string;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [ticketReplies, setTicketReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/admin/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketReplies = async (ticketId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/support/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setTicketReplies(data.replies || []);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.id);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    setReplyMessage("");
    setTicketReplies([]);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
        setTickets(
          tickets.map((t) =>
            t.id === selectedTicket.id ? { ...t, status: newStatus as any } : t,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/admin/tickets/${selectedTicket.id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: replyMessage,
            adminName: "Admin",
          }),
        },
      );

      if (response.ok) {
        setReplyMessage("");
        await fetchTicketReplies(selectedTicket.id);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "in-progress":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "resolved":
        return "bg-green-50 border-green-200 text-green-700";
      case "closed":
        return "bg-gray-50 border-gray-200 text-gray-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50";
      case "medium":
        return "bg-yellow-50";
      case "low":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-700";
      case "medium":
        return "text-yellow-700";
      case "low":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedTicket) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-0">
          {/* Navigation Grid - Desktop/Tablet Only */}
          <div className="hidden md:block border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm">
            <div className="px-6 lg:px-8 py-6 max-w-4xl mx-auto">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">
                Quick Navigation
              </h2>
              <AdminNavigationGrid />
            </div>
          </div>

          <div className="py-8 md:py-12 px-3 sm:px-6 lg:px-8">
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
          </div>
        </main>
        <MobileAdminPanel />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-6">
        {/* Navigation Grid - Desktop/Tablet Only */}
        <div className="hidden md:block border-b border-white/10">
          <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            <h2 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wide">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 pt-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Support Tickets
            </h1>
            <p className="text-white/60">
              Manage customer support tickets and respond to inquiries
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm uppercase tracking-wide mb-1">
                    Total Tickets
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {tickets.length}
                  </p>
                </div>
                <div className="text-4xl opacity-50">📋</div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm uppercase tracking-wide mb-1">
                    Open
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {tickets.filter((t) => t.status === "open").length}
                  </p>
                </div>
                <div className="text-4xl opacity-50">🔵</div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm uppercase tracking-wide mb-1">
                    Resolved
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {tickets.filter((t) => t.status === "resolved").length}
                  </p>
                </div>
                <div className="text-4xl opacity-50">✅</div>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-8 text-center">
              <Loader className="w-8 h-8 animate-spin text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm p-8 text-center">
              <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No support tickets yet.</p>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {ticket.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status.charAt(0).toUpperCase() +
                              ticket.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBg(ticket.priority)} ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority.charAt(0).toUpperCase() +
                              ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleSelectTicket(ticket)}
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileAdminPanel />
    </>
  );
}
