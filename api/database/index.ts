export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json({
      exists: false,
      data: null,
      message: 'Vercel Serverless Endpoint Ready'
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Database berhasil diproses di server Vercel',
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
