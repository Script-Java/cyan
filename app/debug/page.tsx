"use client";

import { useState, useCallback } from "react";
import { RouteDebugger, TestResult, availableRoutes } from "../[...slug]/route-debugger";

export default function RouteDebugPage() {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentRoute, setCurrentRoute] = useState<string>("");
    const [filter, setFilter] = useState<"all" | "success" | "error">("all");

    const runTests = useCallback(async () => {
        setIsRunning(true);
        setResults([]);
        
        const debugger_ = new RouteDebugger((result: TestResult) => {
            setCurrentRoute(result.route);
            setResults(prev => [...prev, result]);
        });

        await debugger_.testAllRoutes(3);
        setIsRunning(false);
        setCurrentRoute("");
    }, []);

    const testSingleRoute = useCallback(async (route: string) => {
        const debugger_ = new RouteDebugger();
        const result = await debugger_.testRoute(route);
        setResults(prev => {
            const filtered = prev.filter(r => r.route !== route);
            return [...filtered, result];
        });
    }, []);

    const filteredResults = results.filter(r => {
        if (filter === "all") return true;
        return r.status === filter;
    });

    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Route Debugger</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-lg font-semibold">
                                Total Routes: {availableRoutes.length}
                            </p>
                            <p className="text-green-600">Successful: {successCount}</p>
                            <p className="text-red-600">Failed: {errorCount}</p>
                        </div>
                        <button
                            onClick={runTests}
                            disabled={isRunning}
                            className={`px-6 py-3 rounded-lg font-semibold ${
                                isRunning 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                            {isRunning ? `Testing ${currentRoute}...` : "Test All Routes"}
                        </button>
                    </div>

                    {isRunning && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(results.length / availableRoutes.length) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        >
                            All ({results.length})
                        </button>
                        <button
                            onClick={() => setFilter("success")}
                            className={`px-4 py-2 rounded ${filter === "success" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                        >
                            Success ({successCount})
                        </button>
                        <button
                            onClick={() => setFilter("error")}
                            className={`px-4 py-2 rounded ${filter === "error" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                        >
                            Errors ({errorCount})
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredResults.map((result) => (
                        <div 
                            key={result.route}
                            className={`p-4 rounded-lg border ${
                                result.status === "success" 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-red-50 border-red-200"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className={`text-2xl ${result.status === "success" ? "text-green-600" : "text-red-600"}`}>
                                        {result.status === "success" ? "✓" : "✗"}
                                    </span>
                                    <div>
                                        <code className="font-mono text-sm bg-white px-2 py-1 rounded">
                                            {result.route}
                                        </code>
                                        {result.loadTime && (
                                            <span className="ml-2 text-sm text-gray-600">
                                                {result.loadTime.toFixed(2)}ms
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => testSingleRoute(result.route)}
                                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    Retry
                                </button>
                            </div>
                            {result.error && (
                                <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800 font-mono">
                                    {result.error}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {results.length === 0 && !isRunning && (
                    <div className="text-center py-12 text-gray-500">
                        Click "Test All Routes" to begin testing
                    </div>
                )}
            </div>
        </div>
    );
}
