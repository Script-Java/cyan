import { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server/index";

const app = createServer();

export default async (req: VercelRequest, res: VercelResponse) => {
  // Forward all requests to Express app
  return new Promise((resolve) => {
    app(req, res as any, () => {
      resolve(undefined);
    });
  });
};
