// Netlify Function handler for API routes
import serverless from "serverless-http";

let handler: any;

// Lazy load the server on first request
async function getHandler() {
  if (!handler) {
    try {
      // Import the server creator
      const { createServer } = await import("../../server/index.js");
      const app = createServer();
      handler = serverless(app);
      console.log("✅ Serverless handler initialized");
    } catch (error) {
      console.error("❌ Failed to initialize serverless handler:", error);
      throw error;
    }
  }
  return handler;
}

// Export handler for Netlify Functions
export default async (req: any, context: any) => {
  try {
    const fn = await getHandler();
    return fn(req, context);
  } catch (error) {
    console.error("❌ Handler error:", error);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to initialize API handler" }),
    };
  }
};
