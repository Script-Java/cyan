import type { NextApiRequest, NextApiResponse } from 'next';
import { createServer } from '../../server/index';

// Initialize the Express app once (reused across invocations in the same container)
const app = createServer();

// Disable Next.js body parsing to let Express handle it
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        // Express app is a (req, res, next) function — call it directly
        // No need for serverless-http; Next.js API routes already provide
        // Node.js-compatible IncomingMessage / ServerResponse objects.
        app(req as any, res as any);
        res.on('finish', resolve);
        res.on('error', reject);
    });
}
