// api/_auth.js
// Every write and every AI/scrape endpoint in this tool was reachable by
// anyone who knew the URL: a stranger could overwrite a building record in
// KV, push files into our Blob store, or burn Claude credits on
// research-building. Writes now require a shared token.
//
// Set NC_ADMIN_TOKEN on the Vercel project. If it is unset, writes fail
// CLOSED (503) rather than falling back to open — an unconfigured deploy
// should refuse to write, not accept anything.
//
// The browser side attaches the header automatically (see src/main.jsx);
// the token is stored in localStorage and prompted for once.
export function requireNcAuth(req, res) {
  const expected = process.env.NC_ADMIN_TOKEN;
  if (!expected) {
    res.status(503).json({ error: 'NC_ADMIN_TOKEN is not configured on this deployment — writes are disabled.' });
    return false;
  }
  const supplied =
    req.headers['x-nc-token'] ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
    (req.query && req.query.token);
  if (supplied !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
