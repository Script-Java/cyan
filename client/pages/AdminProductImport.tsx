import Header from "@/components/Header";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminProductImport() {
  const [csvText, setCsvText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      toast({
        title: "Error",
        description: "Please upload or paste CSV data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = JSON.stringify({ csv_data: csvText });

      const response = await fetch("/api/import-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      let result: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { error: text || "Invalid response from server" };
      }

      if (!response.ok) {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import products",
          variant: "destructive",
        });
        console.error("Import response:", response.status, result);
      } else {
        setImportResult(result);
        toast({
          title: "Success",
          description: `Imported ${result.imported_count || 0} products`,
        });
        setCsvText("");
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import products";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `id,ecwid_id,sku,name,description,price,image_url,rating,reviews_count
1,785848122,3-INCH-PROMO,"3\" INCH - 200 CUSTOM STICKER PROMOTION","Premium vinyl stickers perfect for laptops, phones, and outdoor use. Durable and weather-resistant.",0.26,https://example.com/image1.jpg,4.8,234
2,790950034,SQUARE-STICKER,"SQUARE STICKER","Classic square vinyl stickers with vibrant full-color printing. Perfect for branding and personal use.",0.22,https://example.com/image2.jpg,4.9,189`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Import Products
            </h1>

            <div className="space-y-8">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">
                      CSV Format Requirements
                    </h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Your CSV file must include the following columns:
                    </p>
                    <ul className="text-blue-800 text-sm space-y-1 ml-4">
                      <li>
                        • <strong>name</strong> (required) - Product name
                      </li>
                      <li>
                        • <strong>price</strong> (required) - Product price
                      </li>
                      <li>• sku (optional) - Stock keeping unit</li>
                      <li>
                        • <strong>ecwid_id</strong> (optional) - Ecwid product
                        ID
                      </li>
                      <li>
                        • <strong>description</strong> (optional) - Product
                        description
                      </li>
                      <li>
                        • <strong>image_url</strong> (optional) - Product image
                        URL
                      </li>
                      <li>• rating (optional) - Star rating (0-5)</li>
                      <li>• reviews_count (optional) - Number of reviews</li>
                    </ul>
                    <button
                      onClick={downloadTemplate}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* CSV Input */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Upload or Paste CSV
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste CSV Data
                    </label>
                    <textarea
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="Paste CSV content here or upload a file..."
                      className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleImport}
                  disabled={isLoading || !csvText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  {isLoading ? "Importing..." : "Import Products"}
                </button>
                <button
                  onClick={() => {
                    setCsvText("");
                    setImportResult(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Clear
                </button>
              </div>

              {/* Results */}
              {importResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-2">
                        Import Successful
                      </h3>
                      <p className="text-green-800 mb-4">
                        {importResult.message}
                      </p>
                      {importResult.products &&
                        importResult.products.length > 0 && (
                          <div className="bg-white rounded border border-green-200 overflow-hidden">
                            <div className="px-4 py-2 bg-green-100 border-b border-green-200">
                              <p className="text-sm font-medium text-green-900">
                                Imported Products
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-green-200">
                                  <tr>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">
                                      Name
                                    </th>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">
                                      SKU
                                    </th>
                                    <th className="text-right px-4 py-2 font-medium text-gray-700">
                                      Price
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {importResult.products
                                    .slice(0, 5)
                                    .map((product: any) => (
                                      <tr
                                        key={product.id}
                                        className="border-b border-gray-200"
                                      >
                                        <td className="px-4 py-2 text-gray-900">
                                          {product.name}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">
                                          {product.sku || "—"}
                                        </td>
                                        <td className="text-right px-4 py-2 text-gray-900 font-medium">
                                          $
                                          {parseFloat(product.price).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                            {importResult.products.length > 5 && (
                              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                                ... and {importResult.products.length - 5} more
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
