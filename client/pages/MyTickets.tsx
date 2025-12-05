import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Plus,
  Send,
  Loader,
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

interface Ticket {
  id: number;
  subject: string;
  category: string;
  priority: string;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
  reply_count?: number;
}

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [filter, setFilter] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      const customerId = localStorage.getItem("customerId");

      if (!token || !customerId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `/api/support/tickets?customerId=${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load your tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const customerId = localStorage.getItem("customerId");

      const response = await fetch(
        `/api/support/tickets/${ticketId}?customerId=${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ticket details");
      }

      const data = await response.json();
      setSelectedTicket(data.ticket);
      setTicketReplies(data.replies || []);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      toast.error("Failed to load ticket details");
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    fetchTicketDetails(ticket.id);
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setTicketReplies([]);
    setReplyMessage("");
  };

  const handleSubmitReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSubmittingReply(true);

    try {
      const token = localStorage.getItem("authToken");
      const customerId = localStorage.getItem("customerId");

      if (!token || !customerId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `/api/support/tickets/${selectedTicket.id}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: replyMessage,
            customerId: parseInt(customerId),
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reply");
      }

      toast.success("Reply sent!");
      setReplyMessage("");

      // Add reply to local state
      const newReply = {
        id: Date.now().toString(),
        sender_name: "You",
        sender_type: "customer",
        message: replyMessage,
        created_at: new Date().toISOString(),
      };
      setTicketReplies([...ticketReplies, newReply]);
    } catch (error) {
      console.error("Error sending reply:", error);
      const message =
        error instanceof Error ? error.message : "Failed to send reply";
      toast.error(message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tickets
            </button>

            {/* Ticket Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Ticket ID:{" "}
                    <span className="font-mono">{selectedTicket.id}</span>
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(selectedTicket.status)}`}
                >
                  {selectedTicket.status.toUpperCase()}
                </div>
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
                    {selectedTicket.priority.charAt(0).toUpperCase() +
                      selectedTicket.priority.slice(1)}
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
                  Your Message
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              {/* Replies */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Conversation ({ticketReplies.length})
                </h3>

                {ticketReplies.length === 0 ? (
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800">
                      No replies yet. We're working on your ticket!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                                ? "Support Team"
                                : "You"}
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
              <div className="border-t border-gray-200 mt-8 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Add Your Reply
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                  <button
                    onClick={handleSubmitReply}
                    disabled={isSubmittingReply || !replyMessage.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingReply ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                My Support Tickets
              </h1>
              <p className="text-gray-600 mt-2">
                Track your support requests and responses
              </p>
            </div>
            <button
              onClick={() => navigate("/support")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {["all", "open", "in-progress", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
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
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading your tickets...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tickets yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first support ticket to get help from our team
              </p>
              <button
                onClick={() => navigate("/support")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Create New Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets
                .filter(
                  (ticket) => filter === "all" || ticket.status === filter,
                )
                .map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket)}
                    className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status.toUpperCase()}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBg(ticket.priority)} ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-600">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
