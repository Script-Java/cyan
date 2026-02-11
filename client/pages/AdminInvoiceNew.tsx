import InvoiceBuilder from "@/components/InvoiceBuilder";
import AdminLayout from "@/components/AdminLayout";

export default function AdminInvoiceNew() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Create Invoice
        </h1>
        <p className="text-gray-600">
          Create a new invoice and send it to your customer
        </p>
      </div>
      <InvoiceBuilder />
    </AdminLayout>
  );
}
