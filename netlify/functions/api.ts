import serverless from "serverless-http";
import { createServer } from "../../server/index";

const app = createServer();

// Wrap the Express app with serverless-http
const handler = serverless(app, {
  // Tell serverless-http to properly handle the request body
  request: (request: any, event: any, context: any) => {
    // Log the incoming event for debugging
    console.log("🔍 Netlify function event:", {
      httpMethod: event.httpMethod,
      path: event.path,
      headers: {
        "Content-Type": event.headers?.["content-type"],
        "Content-Length": event.headers?.["content-length"],
      },
      bodyType: typeof event.body,
      body: event.body?.substring?.(0, 100) || event.body,
      isBase64Encoded: event.isBase64Encoded,
    });
  },
});

export { handler };
