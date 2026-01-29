import Header from "@/components/Header";
import InvoiceBuilder from "@/components/InvoiceBuilder";

export default function AdminInvoiceNew() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create Invoice
            </h1>
            <p className="text-gray-600">
              Create a new invoice and send it to your customer
            </p>
          </div>
          <InvoiceBuilder />
        </div>
      </main>
    </>
  );
}
