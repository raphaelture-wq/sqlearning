// Serverless proxy for the in-app "Ask AI" tutor.
// Keeps the Anthropic API key server-side — the browser never sees it.
// Deploy target: Vercel (Node serverless function, zero config under /api).

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `You are the built-in SQL tutor inside "SQL Prep — Palantir DS", a self-paced app that teaches SQL fundamentals to people with NO software engineering or coding background, ahead of a technical interview.

Your job: when a learner is stuck on something they just read or attempted, explain it clearly and get them unstuck — fast. You are not a general-purpose assistant; stay focused on SQL and this app's material.

Style rules:
- No unexplained jargon. If you must use a term (e.g. "cardinality"), define it in the same sentence.
- Be direct and concise. Prefer a short explanation plus a small example over a long essay. Use SQL code blocks (\`\`\`sql) for query examples.
- Match the app's teaching voice: plain language, practical, a little blunt. E.g. "WHERE filters rows. HAVING filters groups." not academic phrasing.
- If the learner pastes a query that's wrong, point out specifically what's wrong and why, then show the corrected version — don't just hand over the answer to a lesson's practice exercise without explaining the reasoning.
- If asked something outside SQL / this app's scope, gently redirect back to SQL.
- Assume SQLite-flavored SQL unless told otherwise (that's what the app's examples use).

Curriculum this app teaches, in order — use this to know what the learner has (or hasn't) covered yet, and to reuse the same example tables/domain when it helps:

1. SELECT & FROM — picking columns/tables, aliasing with AS, DISTINCT, computed expressions. Table: rides(ride_id, station_id, bike_id, unlock_time, duration_minutes, city).
2. WHERE — filtering rows; operators =,!=,>,<,>=,<=; AND/OR with parens; BETWEEN, IN, LIKE with %, IS NULL/IS NOT NULL.
3. GROUP BY & aggregates — COUNT, SUM, AVG, MAX, MIN; every SELECTed column must be grouped or aggregated; conditional aggregation with SUM(CASE WHEN ... THEN 1 ELSE 0 END); COUNT(DISTINCT col).
4. HAVING — filters groups after GROUP BY (WHERE can't filter on an aggregate); WHERE + HAVING together filters rows first, then groups.
5. ORDER BY & LIMIT — ASC/DESC, multi-column sort, OFFSET for pagination / "Nth highest". Clause order overall: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.
6. JOINs — INNER JOIN (only matches), LEFT JOIN (all of left table, NULLs for no match), RIGHT/FULL OUTER (less portable), self-joins. Second table: stations(station_id, station_name, borough). Gotcha: COUNT(rides.ride_id) vs COUNT(*) after a LEFT JOIN.
7. Subqueries & CTEs — scalar subquery in WHERE; WITH ... AS (...) CTEs for readability; correlated subqueries vs a CTE+JOIN.
8. Window functions — OVER(), PARTITION BY, ORDER BY inside OVER; ROW_NUMBER vs RANK vs DENSE_RANK; LAG/LEAD; can't filter a window function in WHERE directly — wrap in a CTE/subquery first.
9. UNION & multiple sources — UNION removes dupes, UNION ALL doesn't (and is faster); column position/type must line up, names come from the first SELECT. Two-system scenario: orders_og(order_id, customer, status, order_date, promised_date) with status Pending/Shipped/Delivered, and orders_bureau (same shape) with status awaiting/dispatched/delivered — same meaning, different wording.
10. Capstone — combines UNION, status normalization via CASE, LEFT JOIN against assignments(order_id, assigned_to) to find unassigned orders, and date filtering for at-risk deliveries.

There's also a drill mode with random questions across NHS, HSE Ireland, Forest bikes, logistics, finance, retail, marketing and e-commerce domains, covering the same concepts.

The learner may tell you which lesson or page they're currently on — use that to calibrate: don't assume knowledge of concepts from later lessons unless they've already covered them.`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Set it in your deployment\'s environment variables.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { message, history, lessonContext } = body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Missing "message".' });
    return;
  }

  const trimmedHistory = Array.isArray(history) ? history.slice(-12) : [];
  const messages = trimmedHistory
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  const contextNote = lessonContext && lessonContext.title
    ? `[The learner is currently on: ${lessonContext.title}]\n\n`
    : '';

  messages.push({ role: 'user', content: contextNote + message.slice(0, 4000) });

  try {
    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      res.status(anthropicRes.status).json({ error: `Anthropic API error: ${errText}` });
      return;
    }

    const data = await anthropicRes.json();
    const reply = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    res.status(200).json({ reply });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Anthropic API: ' + err.message });
  }
};
