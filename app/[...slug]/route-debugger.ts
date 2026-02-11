// Debug utility to test all routes and identify problematic components
// Run this in browser console or add to page for debugging

import { routeMap, availableRoutes, matchRoute } from "./route-map";

export interface TestResult {
    route: string;
    status: "success" | "error" | "loading";
    error?: string;
    loadTime?: number;
}

export class RouteDebugger {
    private results: TestResult[] = [];
    private onProgress?: (result: TestResult) => void;

    constructor(onProgress?: (result: TestResult) => void) {
        this.onProgress = onProgress;
    }

    async testRoute(route: string): Promise<TestResult> {
        const loader = routeMap[route];
        if (!loader) {
            const result: TestResult = {
                route,
                status: "error",
                error: "No loader found for route",
            };
            this.results.push(result);
            this.onProgress?.(result);
            return result;
        }

        const startTime = performance.now();
        
        try {
            console.log(`[RouteDebugger] Testing route: ${route}`);
            const mod = await loader();
            const loadTime = performance.now() - startTime;

            if (!mod.default) {
                const result: TestResult = {
                    route,
                    status: "error",
                    error: "Component missing default export",
                    loadTime,
                };
                this.results.push(result);
                this.onProgress?.(result);
                return result;
            }

            const result: TestResult = {
                route,
                status: "success",
                loadTime,
            };
            this.results.push(result);
            this.onProgress?.(result);
            console.log(`[RouteDebugger] ✓ ${route} loaded in ${loadTime.toFixed(2)}ms`);
            return result;
        } catch (err) {
            const loadTime = performance.now() - startTime;
            const errorMessage = err instanceof Error ? err.message : String(err);
            
            const result: TestResult = {
                route,
                status: "error",
                error: errorMessage,
                loadTime,
            };
            this.results.push(result);
            this.onProgress?.(result);
            console.error(`[RouteDebugger] ✗ ${route} failed: ${errorMessage}`);
            return result;
        }
    }

    async testAllRoutes(batchSize: number = 5): Promise<TestResult[]> {
        this.results = [];
        const routes = availableRoutes;
        
        console.log(`[RouteDebugger] Testing ${routes.length} routes in batches of ${batchSize}`);

        for (let i = 0; i < routes.length; i += batchSize) {
            const batch = routes.slice(i, i + batchSize);
            console.log(`[RouteDebugger] Testing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(routes.length / batchSize)}`);
            
            // Test routes in parallel within batch
            await Promise.all(batch.map(route => this.testRoute(route)));
            
            // Small delay between batches to prevent overwhelming the browser
            if (i + batchSize < routes.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return this.results;
    }

    async testRouteByPathname(pathname: string): Promise<TestResult> {
        const { loader } = matchRoute(pathname);
        if (!loader) {
            return {
                route: pathname,
                status: "error",
                error: `No route matches pathname: ${pathname}`,
            };
        }

        // Find the route key
        const route = availableRoutes.find(r => routeMap[r] === loader) || pathname;
        return this.testRoute(route);
    }

    getResults(): TestResult[] {
        return this.results;
    }

    getFailedRoutes(): TestResult[] {
        return this.results.filter(r => r.status === "error");
    }

    getSuccessfulRoutes(): TestResult[] {
        return this.results.filter(r => r.status === "success");
    }

    generateReport(): string {
        const failed = this.getFailedRoutes();
        const successful = this.getSuccessfulRoutes();
        
        let report = `\n=== Route Debug Report ===\n`;
        report += `Total Routes: ${this.results.length}\n`;
        report += `Successful: ${successful.length}\n`;
        report += `Failed: ${failed.length}\n`;
        
        if (failed.length > 0) {
            report += `\n=== Failed Routes ===\n`;
            failed.forEach(r => {
                report += `\n${r.route}:\n`;
                report += `  Error: ${r.error}\n`;
            });
        }

        const avgLoadTime = successful.reduce((acc, r) => acc + (r.loadTime || 0), 0) / successful.length;
        report += `\n=== Performance ===\n`;
        report += `Average load time: ${avgLoadTime.toFixed(2)}ms\n`;
        
        const slowest = [...successful].sort((a, b) => (b.loadTime || 0) - (a.loadTime || 0)).slice(0, 5);
        report += `\nSlowest 5 routes:\n`;
        slowest.forEach(r => {
            report += `  ${r.route}: ${r.loadTime?.toFixed(2)}ms\n`;
        });

        return report;
    }
}

// Helper function to run tests from console
export async function debugRoutes() {
    const debugger_ = new RouteDebugger();
    await debugger_.testAllRoutes(3);
    console.log(debugger_.generateReport());
    return debugger_.getResults();
}

// Export for use in components
export { availableRoutes, matchRoute };
