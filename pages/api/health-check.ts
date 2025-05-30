import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    status: 'ok',
    message: 'API server is running',
    timestamp: new Date().toISOString()
  });
} 