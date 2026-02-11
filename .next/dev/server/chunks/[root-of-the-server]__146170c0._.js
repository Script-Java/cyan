module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/[...slug].ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$serverless$2d$http__$5b$external$5d$__$28$serverless$2d$http$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$serverless$2d$http$29$__ = __turbopack_context__.i("[externals]/serverless-http [external] (serverless-http, cjs, [project]/node_modules/serverless-http)");
(()=>{
    const e = new Error("Cannot find module '../../../server/index'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
// Initialize the Express app
const app = createServer();
// Create the serverless handler
const handler = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$serverless$2d$http__$5b$external$5d$__$28$serverless$2d$http$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$serverless$2d$http$29$__["default"])(app);
const config = {
    api: {
        bodyParser: false,
        externalResolver: true
    }
};
async function __TURBOPACK__default__export__(req, res) {
    // Add protocol if missing (fix for some internal redirects)
    if (!req.url?.startsWith('http')) {
        // @ts-ignore
        req.protocol = 'https';
    }
    return handler(req, res);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__146170c0._.js.map