import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, Users, ShoppingCart, Upload, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MigrationStatus {
  ecwid: {
    customers: number;
    orders: number;
  };
  supabase: {
    customers: number;
    orders: number;
  };
}

interface MigrationResult {
  customersImported: number;
  customersSkipped: number;
  ordersImported: number;
  ordersSkipped: number;
  errors: string[];
}

export default function AdminEcwidMigration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(
    null,
  );
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(
    null,
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvPreview, setCSVPreview] = useState<string>("");

  useEffect(() => {
    fetchMigrationStatus();
  }, []);

  const fetchMigrationStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/admin/ecwid/migration-status", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch migration status");
      }

      const data = await response.json();
      setMigrationStatus(data);
    } catch (error) {
      console.error("Error fetching migration status:", error);
      toast({
        title: "Error",
        description: "Failed to load migration status",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleStartMigration = async () => {
    if (
      !window.confirm(
        "This will import all historical customers and orders from Ecwid. Continue?",
      )
    ) {
      return;
    }

    try {
      setIsMigrating(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/admin/ecwid/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Migration failed");
      }

      const data = await response.json();
      setMigrationResult(data.result);

      toast({
        title: "Success",
        description: "Ecwid migration completed successfully",
      });

      setTimeout(() => {
        fetchMigrationStatus();
      }, 1000);
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Error",
        description: "Failed to complete migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCSVFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File must be smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setCSVFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const preview = text.split("\n").slice(0, 4).join("\n");
      setCSVPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImportingCSV(true);
      const csvText = await csvFile.text();
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please log in.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/ecwid/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvData: csvText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `CSV import failed (${response.status})`);
      }

      const data = await response.json();
      setMigrationResult(data.result);
      setCSVFile(null);
      setCSVPreview("");

      toast({
        title: "Success",
        description: `Imported ${data.result.customersImported} customers`,
      });

      setTimeout(() => {
        fetchMigrationStatus();
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import CSV";
      console.error("CSV import error:", error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsImportingCSV(false);
    }
  };

  const clearCSV = () => {
    setCSVFile(null);
    setCSVPreview("");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa] text-black">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Ecwid Data Migration</h1>
            <p className="text-gray-600">
              Migrate historical customers and orders from Ecwid to your store
            </p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Ecwid Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Ecwid Store</h2>
              </div>
              {isLoadingStatus ? (
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Customers:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {migrationStatus?.ecwid.customers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {migrationStatus?.ecwid.orders || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Supabase Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold">Your Store</h2>
              </div>
              {isLoadingStatus ? (
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Customers:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {migrationStatus?.supabase.customers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {migrationStatus?.supabase.orders || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Migration Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold mb-2">Ready to Migrate?</h3>
                <p className="text-gray-700 mb-4">
                  Click the button below to import all historical customers and orders from
                  Ecwid. This will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Import all customers with their emails and contact info</li>
                  <li>Import all historical orders with order numbers and tracking info</li>
                  <li>Automatically link orders to customers by email address</li>
                  <li>
                    Allow customers to see their order history when they sign up with their
                    Ecwid email
                  </li>
                </ul>
                <Button
                  onClick={handleStartMigration}
                  disabled={isMigrating || !migrationStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isMigrating ? "Migration in Progress..." : "Start Migration"}
                </Button>
              </div>
            </div>
          </div>

          {/* CSV Import Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Upload className="w-6 h-6 text-purple-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold mb-2">Or Import Customers from CSV</h3>
                <p className="text-gray-700 mb-4">
                  Upload a CSV file with customer data. Supports both simple format and Ecwid export format. Required: email column.
                </p>

                {csvFile ? (
                  <div className="space-y-3">
                    <div className="bg-white border border-purple-200 rounded p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{csvFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(csvFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          onClick={clearCSV}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {csvPreview && (
                        <div className="mb-3 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                          <pre>{csvPreview}</pre>
                        </div>
                      )}

                      <button
                        onClick={handleImportCSV}
                        disabled={isImportingCSV}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
                      >
                        {isImportingCSV ? "Importing..." : "Import CSV"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-purple-300 rounded-lg p-8 cursor-pointer hover:border-purple-400 transition bg-purple-50">
                    <Upload className="w-8 h-8 text-purple-600" />
                    <div className="text-center">
                      <p className="text-gray-900 font-medium">
                        Drag or click to upload CSV
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Max file size: 50MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Migration Results */}
          {migrationResult && (
            <div className="space-y-4">
              <div
                className={`border rounded-lg p-6 ${
                  migrationResult.errors.length === 0
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {migrationResult.errors.length === 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
                  )}
                  <div>
                    <h3 className="font-bold mb-2">Migration Complete</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Customers Imported</p>
                        <p className="text-2xl font-bold text-green-600">
                          {migrationResult.customersImported}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customers Skipped</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {migrationResult.customersSkipped}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Orders Imported</p>
                        <p className="text-2xl font-bold text-green-600">
                          {migrationResult.ordersImported}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Orders Skipped</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {migrationResult.ordersSkipped}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-sm mb-3">Errors Encountered:</h4>
                    <div className="bg-white rounded border border-yellow-200 p-4 max-h-64 overflow-y-auto">
                      {migrationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-gray-700 mb-2">
                          • {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">What happens to my Ecwid store?</h4>
                <p className="text-gray-700">
                  Nothing! This migration is one-way - it copies your data to this new store
                  but doesn't modify your Ecwid account.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">
                  How do customers see their old orders?
                </h4>
                <p className="text-gray-700">
                  When a customer creates an account with the same email address they used in
                  Ecwid, their historical orders will automatically appear in their customer
                  dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Can I run the migration again?</h4>
                <p className="text-gray-700">
                  Yes! The migration is safe to run multiple times. It will skip customers and
                  orders that have already been imported.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">What format should my CSV file have?</h4>
                <p className="text-gray-700 mb-2">
                  Your CSV can use either a simple format or Ecwid's export format.
                </p>
                <p className="text-gray-700 text-sm mb-2 font-semibold">Simple Format:</p>
                <p className="text-gray-700 text-sm font-mono bg-gray-50 p-2 rounded mb-2">
                  email,firstName,lastName,phone,company
                </p>
                <p className="text-gray-700 text-sm mb-2 font-semibold">Ecwid Export Format (automatically detected):</p>
                <p className="text-gray-700 text-sm font-mono bg-gray-50 p-2 rounded">
                  customer_primary_email, customer_full_name, customer_primary_phone_number...
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Just upload your CSV and the system will automatically map the columns.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">What's the CSV file size limit?</h4>
                <p className="text-gray-700">
                  Maximum file size is 50MB. For larger datasets, you can upload multiple files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
