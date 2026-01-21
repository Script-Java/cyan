import serverless from "serverless-http";
import { createServer } from "../../server/index";

// Netlify serverless function handler
export const handler = serverless(createServer());
