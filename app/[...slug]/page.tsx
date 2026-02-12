"use client";

import { useState, useEffect, ComponentType, Suspense, useCallback } from "react";
import { routeMap, matchRoute, availableRoutes } from "./route-map";

const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#F63049] mb-3"></div>
            <p className="text-gray-600 text-sm">Loading...</p>
        </div>
    </div>
);

const NotFoundPage = ({ pathname, availableRoutes }: { pathname: string; availableRoutes: string[] }) => (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <p className="text-gray-500 mb-4">Path: <code className="bg-gray-200 px-2 py-1 rounded">{pathname}</code></p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline block mb-8">Return to Home</a>
            
            <div className="text-left bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-2">Available Routes:</p>
                <div className="max-h-48 overflow-y-auto text-xs text-gray-600 space-y-1">
                    {availableRoutes.map(route => (
                        <div key={route} className="font-mono">{route}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ErrorPage = ({ error, pathname, onRetry }: { error: Error; pathname: string; onRetry: () => void }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 p-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-4 text-red-600">500</h1>
                <p className="text-xl text-gray-600 mb-4">Error loading page</p>
                <p className="text-gray-500 mb-4">Path: <code className="bg-gray-200 px-2 py-1 rounded">{pathname}</code></p>
                
                <div className="space-x-4 mb-6">
                    <button 
                        onClick={onRetry}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                    <a href="/" className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                        Return to Home
                    </a>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-500 underline mb-4"
                >
                    {showDetails ? "Hide Error Details" : "Show Error Details"}
                </button>
                
                {showDetails && (
                    <div className="text-left bg-red-50 border border-red-200 p-4 rounded-lg overflow-auto max-h-96">
                        <p className="text-sm font-semibold text-red-800 mb-2">Error Message:</p>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap">{error.message}</pre>
                        {error.stack && (
                            <>
                                <p className="text-sm font-semibold text-red-800 mb-2 mt-4">Stack Trace:</p>
                                <pre className="text-xs text-red-700 whitespace-pre-wrap">{error.stack}</pre>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

function LegacyPageLoader() {
    const [Component, setComponent] = useState<ComponentType<any> | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [RRD, setRRD] = useState<any>(null);
    const [params, setParams] = useState<Record<string, string>>({});
    const [pathname, setPathname] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    const loadPage = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setIsNotFound(false);
        setComponent(null);

        try {
            const currentPathname = window.location.pathname;
            setPathname(currentPathname);

            // Match the route
            const { loader, params: matchedParams } = matchRoute(currentPathname);
            setParams(matchedParams);

            if (!loader) {
                console.warn(`[CatchAll] No route found for: ${currentPathname}`);
                console.log(`[CatchAll] Available routes:`, availableRoutes);
                setIsNotFound(true);
                setIsLoading(false);
                return;
            }

            console.log(`[CatchAll] Loading route: ${currentPathname}`);

            // Load the component and React Router DOM in parallel
            const [mod, rrd] = await Promise.all([
                loader(),
                import("react-router-dom"),
            ]);

            if (!mod.default) {
                throw new Error(`Component at ${currentPathname} does not have a default export`);
            }

            setComponent(() => mod.default);
            setRRD(rrd);
            console.log(`[CatchAll] Successfully loaded: ${currentPathname}`);
        } catch (err) {
            console.error(`[CatchAll] Error loading page:`, err);
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    if (isLoading) return <LoadingFallback />;
    if (error) return <ErrorPage error={error} pathname={pathname} onRetry={loadPage} />;
    if (isNotFound) return <NotFoundPage pathname={pathname} availableRoutes={availableRoutes} />;
    if (!Component || !RRD) return <LoadingFallback />;

    // Wrap the component with BrowserRouter and provide route params
    return (
        <RRD.BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <RRD.Routes>
                <RRD.Route 
                    path="*" 
                    element={
                        <RouteParamsProvider params={params}>
                            <Component />
                        </RouteParamsProvider>
                    } 
                />
            </RRD.Routes>
        </RRD.BrowserRouter>
    );
}

// Provider to inject URL params into React Router context
function RouteParamsProvider({ children, params }: { children: React.ReactNode; params: Record<string, string> }) {
    const location = window.location;
    
    // Create a modified history state that includes our params
    useEffect(() => {
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(location.search);
            Object.entries(params).forEach(([key, value]) => {
                if (!searchParams.has(`_param_${key}`)) {
                    searchParams.set(`_param_${key}`, value);
                }
            });
            
            const newUrl = `${location.pathname}?${searchParams.toString()}${location.hash}`;
            window.history.replaceState(window.history.state, "", newUrl);
        }
    }, [params, location]);

    return <>{children}</>;
}

export default function CatchAllPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LegacyPageLoader />
        </Suspense>
    );
}
