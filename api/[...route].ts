import { createServer } from "../server/index";

const app = createServer();

export default async (req: any, res: any) => {
  // Call the Express app as middleware
  return new Promise<void>((resolve, reject) => {
    app(req, res, (err?: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
