export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    const clientData = req.body || {};
    return res.status(200).json({
      success: true,
      data: clientData,
      message: 'Vercel sync completed'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
