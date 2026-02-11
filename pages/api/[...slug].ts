import type { NextApiRequest, NextApiResponse } from 'next';
import serverless from 'serverless-http';
import { createServer } from '../../server/index';

// Initialize the Express app
const app = createServer();

// Create the serverless handler
const handler = serverless(app);

// Disable Next.js body parsing to let Express handle it
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default async function (req: NextApiRequest, res: NextApiResponse) {
    // Add protocol if missing (fix for some internal redirects)
    if (!req.url?.startsWith('http')) {
        // @ts-ignore
        req.protocol = 'https';
    }

    return handler(req, res);
}
