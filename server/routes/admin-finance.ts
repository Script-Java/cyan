import { RequestHandler } from "express";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueChange: number;
  orderChange: number;
}

/**
 * Get finance data (mock data for now)
 * In a real implementation, this would fetch from your orders/payments database
 */
export const handleGetFinance: RequestHandler = async (req, res) => {
  try {
    // Mock finance data
    // In production, this would be calculated from your orders and payment records
    const financeData: FinanceStats = {
      totalRevenue: 5847.32,
      monthlyRevenue: 2145.67,
      averageOrderValue: 127.45,
      totalOrders: 46,
      revenueChange: 12.5,
      orderChange: 8.3,
    };

    return res.json(financeData);
  } catch (error) {
    console.error("Error fetching finance data:", error);
    return res.status(500).json({
      error: "Failed to fetch finance data",
    });
  }
};
