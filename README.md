# SQL Interview Prep App

> Built for the Palantir Deployment Strategist technical interview (July 30, 2026). No installation required — open `index.html` in any browser and start learning.

---

## What this is

The Palantir DS interview includes a **Technical Comprehension round** where you are taught something unfamiliar on the spot and expected to apply it quickly. SQL is consistently cited by candidates who have been through the process.

This tool covers the fundamentals you need — not every SQL concept, just the ones that matter for reading and querying operational data tables under pressure.

**The goal is not mastery. The goal is fluency under pressure** — being able to read a table, form a hypothesis, write a query, and explain your reasoning out loud without freezing.

---

## Who this is for

This tool is built for people who have **no software engineering or computer science background** — consultants, analysts, business graduates, and anyone coming from a non-technical field who needs to get comfortable with SQL quickly.

No prior coding experience required. No jargon assumed. If you can read a spreadsheet, you can learn SQL. This tool meets you where you are and gets you to where you need to be for the interview — nothing more, nothing less.

---

## How to learn SQL with this tool

The best way to learn SQL is not to read about it. It is to **write queries yourself**, make mistakes, understand why they fail, and try again. Every lesson in this app follows the same pattern:

1. **Read the concept** — understand what the clause does and why
2. **Study the worked example** — see it in action on a real table
3. **Write the query yourself** — from scratch, without copying
4. **Check your answer** — immediate feedback tells you what's right and what's wrong
5. **Move on** — don't overthink it, repetition across lessons builds the muscle

The drill mode fires random questions across different domains. Use it daily. Ten minutes of writing queries is worth more than an hour of reading about them.

---

## What it covers, and how hard to drill each part

The technical comprehension round tests fluency with fundamentals under pressure, not SQL trivia — so effort is weighted accordingly.

**Know cold** — these are the default learning path, in order:

| Lesson | Concept |
|--------|---------|
| 1 | `SELECT` & `FROM` — picking columns and tables |
| 2 | `WHERE` — filtering rows, plus `DISTINCT`, `CASE WHEN`, and date logic / `DATEDIFF` |
| 3 | `GROUP BY` & aggregate functions — `COUNT`, `SUM`, `AVG`, `MAX`, `MIN` |
| 4 | `HAVING` — filtering groups (the most commonly confused clause) |
| 5 | `ORDER BY` & `LIMIT` — sorting and capping results |
| 6 | `JOIN` — connecting two tables (`INNER`, `LEFT`) |
| — | **Decomposition Framework** — turning a vague business ask into 2–4 concrete, data-answerable sub-questions before touching SQL. This is the other half of the interview, not an afterthought. |

**Nice to have, not essential:**
- Subqueries & CTEs — most of what they do can also be done with a JOIN or HAVING.

**Don't bother drilling — included but marked optional in the app:**
- Window functions (`RANK`, `ROW_NUMBER`, running totals) — too advanced for this round.
- `UNION` / combining multiple sources — unlikely to come up.
- The two-system capstone — a good decomposition exercise, but leans on UNION/CTE syntax that isn't core.

Drill mode excludes window-function and UNION questions by default (toggle to include them if you want extra reps once the core is solid).

---

## How to use it

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/sql-palantir-prep.git

# 2. Open in browser — no server needed
open index.html
```

Or just download the ZIP and open `index.html` directly in Chrome.

Opening `index.html` directly (no server) works fine for every lesson, drill, and the reference page — the only feature that needs deployment is the **Ask AI** tutor below.

---

## Ask AI — an in-app SQL tutor

There's a chat panel (bottom-right "💬 Ask AI" button) for whenever a concept doesn't click. It's grounded in this app's exact curriculum — the same tables, lessons, and terminology you're seeing on screen — so answers stay consistent with what you've already learned instead of introducing new jargon.

It needs a small backend to keep the Claude API key off the client, so it only works once deployed (not when opening `index.html` locally from disk). This repo already deploys via **Netlify**, so the proxy is a Netlify Function:

1. Push this repo to GitHub (already connected to a Netlify site, which auto-builds on every push/PR).
2. In the Netlify site's **Site configuration → Environment variables**, add `ANTHROPIC_API_KEY` with your [Anthropic API key](https://console.anthropic.com/settings/keys).
3. Redeploy (or just push — Netlify picks up `netlify.toml`, which points it at `netlify/functions/` and redirects `/api/*` to the deployed function automatically). The chat button will now work on the deployed URL.

The proxy (`netlify/functions/chat.js`) never returns the API key to the browser — it just forwards your question plus your current lesson as context to Claude and relays the reply back.

---

## File structure

```
├── index.html                  # Full app — all lessons, drills, reference, and the Ask AI widget
├── netlify/functions/chat.js   # Serverless proxy that calls the Claude API (keeps the key server-side)
├── netlify.toml                # Points Netlify at the functions dir and redirects /api/* to it
├── .env.example                # Template for the ANTHROPIC_API_KEY env var
└── README.md                   # This file
```

---

## The one rule

Don't just read the examples. **Write every query yourself** before checking the answer.

The HackerRank CodePair session is live — the only preparation that transfers is doing it with your own hands.

---

## The three DS rules for SQL in interviews

1. **Narrate everything out loud as you type** — silence is unreadable to the interviewer
2. **Write something that works first**, then improve it
3. **If you're stuck, ask a clarifying question** — they expect it and want to see it

---

## Context

The Palantir DS fit interview (Round 2) includes a technical comprehension component where you are taught something unfamiliar and expected to apply it quickly, followed by a decomposition round where you analyse data tables to answer business questions. SQL fundamentals are the consistent thread across both.

This app covers exactly what you need and nothing more.
