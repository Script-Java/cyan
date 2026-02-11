"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    DollarSign,
    TrendingUp,
    Zap,
    ArrowRight,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
    id: number;
    customerId: number;
    status: string;
    dateCreated: string;
    total: number;
    itemCount: number;
    shipments?: any[];
}

interface YearBreakdown {
    year: number;
    spent: number;
    orders: number;
    saved: number;
}

export default function Finances() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [yearBreakdown, setYearBreakdown] = useState<YearBreakdown[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [totalSaved, setTotalSaved] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            router.push("/login");
            return;
        }

        const fetchFinanceData = async () => {
            try {
                setIsLoading(true);
                setError("");

                const response = await fetch("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch order data");
                }

                const data = await response.json();
                const allOrders = data.orders || [];
                setOrders(allOrders);

                // Calculate totals
                const total = allOrders.reduce(
                    (sum: number, order: Order) => sum + order.total,
                    0,
                );
                setTotalSpent(total);
                setTotalSaved(total * 0.5); // 50% savings

                // Break down by year
                const byYear: { [key: number]: YearBreakdown } = {};

                allOrders.forEach((order: Order) => {
                    const year = new Date(order.dateCreated).getFullYear();

                    if (!byYear[year]) {
                        byYear[year] = {
                            year,
                            spent: 0,
                            orders: 0,
                            saved: 0,
                        };
                    }

                    byYear[year].spent += order.total;
                    byYear[year].orders += 1;
                    byYear[year].saved = byYear[year].spent * 0.5;
                });

                const breakdown = Object.values(byYear).sort((a, b) => a.year - b.year);
                setYearBreakdown(breakdown);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to load finance data";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinanceData();
    }, [router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const chartData = yearBreakdown.map((item) => ({
        year: item.year.toString(),
        Spent: Math.round(item.spent * 100) / 100,
        Saved: Math.round(item.saved * 100) / 100,
    }));

    const savingsPieData = [
        { name: "Amount Spent", value: Math.round(totalSpent * 100) / 100 },
        { name: "Amount Saved (50%)", value: Math.round(totalSaved * 100) / 100 },
    ];

    const COLORS = ["#3b82f6", "#10b981"];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600 text-lg">
                    Loading your finances...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 sm:p-6 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
                <p className="text-gray-600 mt-2">
                    Track your spending and savings with us
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Financial Data Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You haven't placed any orders yet. Start shopping to see your
                        financial insights here.
                    </p>
                    <Button
                        onClick={() => router.push("/ecwid-store")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Shop Now
                    </Button>
                </div>
            ) : (
                <>
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Spent */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">
                                    Total Spent
                                </h3>
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(totalSpent)}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                                Across {orders.length} order{orders.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {/* Total Saved */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">
                                    Total Saved (50%)
                                </h3>
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="text-3xl font-bold text-emerald-900">
                                {formatCurrency(totalSaved)}
                            </p>
                            <p className="text-xs text-emerald-700 mt-2">
                                vs. competitor pricing
                            </p>
                        </div>

                        {/* Average Order */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">
                                    Average Order
                                </h3>
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatCurrency(totalSpent / orders.length)}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">Per order value</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {yearBreakdown.length > 0 && (
                        <>
                            {/* Year Breakdown Chart */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Spending by Year
                                </h2>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="year" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="Spent"
                                            fill="#3b82f6"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="Saved"
                                            fill="#10b981"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Your Savings Breakdown
                                </h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={savingsPieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) =>
                                                `${name}: ${formatCurrency(value)}`
                                            }
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {savingsPieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}

                    {/* Year Breakdown Table */}
                    {yearBreakdown.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Year Breakdown
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                Year
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                                Total Orders
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                                Amount Spent
                                            </th>
                                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                                Amount Saved (50%)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {yearBreakdown.map((item) => (
                                            <tr
                                                key={item.year}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.year}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                                    {item.orders}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                                    {formatCurrency(item.spent)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-emerald-600 text-right">
                                                    {formatCurrency(item.saved)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Savings Highlight */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-8">
                        <div className="flex items-start gap-4">
                            <Zap className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    You're Saving Big!
                                </h3>
                                <p className="text-gray-700 mb-3">
                                    By choosing Stickerland, you save{" "}
                                    <span className="font-bold text-emerald-600">50%</span>{" "}
                                    compared to traditional sticker shops.
                                </p>
                                <p className="text-gray-700">
                                    That means for every ${" "}
                                    <span className="font-bold">1</span> you spend with us,
                                    you would pay <span className="font-bold">$2</span>{" "}
                                    elsewhere. Your total savings:{" "}
                                    <span className="font-bold text-emerald-600">
                                        {formatCurrency(totalSaved)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
