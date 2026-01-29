import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import InvoiceBuilder from "@/components/InvoiceBuilder";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminInvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/admin/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invoice not found");
        }

        const data = await response.json();
        setInvoiceData(data.data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Edit Invoice
            </h1>
            <p className="text-gray-600">
              Update invoice details and send to customer
            </p>
          </div>
          {invoiceData && (
            <InvoiceBuilder initialData={invoiceData} invoiceId={parseInt(id || "")} />
          )}
        </div>
      </main>
    </>
  );
}
