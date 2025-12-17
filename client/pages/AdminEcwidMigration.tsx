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

  useEffect(() => {
    fetchMigrationStatus();
  }, []);

  const fetchMigrationStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const response = await fetch("/api/admin/ecwid/migration-status");

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
      const response = await fetch("/api/admin/ecwid/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
