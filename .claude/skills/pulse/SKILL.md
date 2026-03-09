# /pulse — Post-deploy health check

Checks production health after a deploy. Run after `/ship`, after Vercel deploys, or whenever something feels off. Closes the feedback loop between shipping and production reality.

## Steps

1. **Check Vercel deployment status:**
   - Use `mcp__vercel__list_deployments` to get the latest deployment
   - Check deployment state (READY, ERROR, BUILDING, QUEUED)
   - If ERROR: report immediately with `mcp__vercel__get_deployment_build_logs` and suggest rollback
   - If BUILDING/QUEUED: report "Deploy in progress — re-run /pulse in a few minutes"

2. **Check Vercel runtime logs for errors (parallel with step 3):**
   - Use `mcp__vercel__get_runtime_logs` with `level: ["error", "fatal"]` and `since: "1h"`
   - If errors found: group by source (serverless, edge, middleware) and report count + sample messages
   - If no errors: report "No runtime errors in the last hour"

3. **Check Supabase events for anomalies (parallel with step 2):**
   - Use `mcp__supabase__execute_sql` to query recent event counts:
     ```sql
     SELECT event_type, COUNT(*) as count
     FROM events
     WHERE created_at > NOW() - INTERVAL '1 hour'
     GROUP BY event_type
     ORDER BY count DESC
     ```
   - Compare to baseline: are session_start events flowing? Are there unusual spikes in any event type?
   - If the events table is empty or has zero recent events: flag "No events in the last hour — possible tracking issue"

4. **Check API health:**
   - Use `mcp__vercel__web_fetch_vercel_url` to hit the production URL (from `mcp__vercel__get_project`)
   - Report HTTP status code
   - If non-200: flag immediately

5. **Present health report:**

```
## Pulse Check — [timestamp]

**Deployment:** [READY / ERROR / BUILDING] — deployed [relative time]
**Runtime errors (1h):** [0 / N errors (grouped by source)]
**API health:** [200 OK / error status]
**Event flow (1h):** [N events across M types / no events (warning)]

**Verdict:** [HEALTHY / DEGRADED / DOWN]
[If DEGRADED/DOWN: suggested action — rollback command, investigate logs, etc.]
```

## When to run

- **After `/ship`** — suggested automatically in `/ship`'s post-merge step
- **After Vercel deploy notifications** — manual trigger
- **When users report issues** — diagnostic tool
- **Proactively** — morning health check before a work session

## Rollback command

If rollback is needed, provide:
```
Use Vercel dashboard to instant-rollback, or redeploy the previous commit:
git revert HEAD && git push origin main
```

## Rules
- This is READ-ONLY. Never modify deployments, data, or code.
- Always check all 4 dimensions (deploy status, runtime logs, events, API health).
- If any dimension is DEGRADED, the overall verdict is DEGRADED.
- If deployment is ERROR or API returns non-200, verdict is DOWN.
- Keep the report concise — one line per dimension, detail only on problems.
