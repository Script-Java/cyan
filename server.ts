import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { createServer as createExpressApp } from "./server/index";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log("Starting Next.js prepare...");
app.prepare().then(() => {
    console.log("Next.js prepared. initializing Express...");
    const server = createExpressApp();

    // Handle all other requests with Next.js
    server.all(/(.*)/, (req: any, res: any) => {
        const parsedUrl = parse(req.url!, true);
        return handle(req, res, parsedUrl);
    });

    server.listen(port, (err?: any) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error("Error during server startup:", err);
    process.exit(1);
});
