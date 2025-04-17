
import { NextApiRequest, NextApiResponse } from 'next';
import { getCredits } from '@/lib/creditManager';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string || 'guest';
  const credits = getCredits(userId);
  return res.status(200).json({ credits });
}
