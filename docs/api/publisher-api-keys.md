# Publisher API Keys

Every publisher organization can generate an API key for programmatic
access — pulling your journal and submission data, and publishing
accepted manuscripts, without a user login. Manage keys from
**Settings → API Access** (visible to the `PUBLISHER` or `ADMIN` role,
one panel per organization you own).

## Authentication

Send the key in an `x-api-key` header on every request. There is no
`Bearer` prefix and no separate login step — the key *is* the
credential.

```bash
curl https://<your-domain>/api/journals/mine \
  -H "x-api-key: rpos_key_<...>"
```

All requests should go through the **API gateway** (`/api/...`), not
directly to a service port — the gateway is the only public entry
point and is what applies rate limiting (see below).

Keys look like `rpos_key_` followed by a 64-character hex string (a
SHA-256 digest of random bytes). They are generated, viewed,
disabled/re-enabled, regenerated, and deleted from the Settings UI;
there is no endpoint to create or manage a key using another key —
that always requires being logged in as the organization's owner (or
an admin).

## Endpoints

All endpoints below are scoped automatically to the organization the
key belongs to — there is no way to pass a different organization ID
and see someone else's data.

### `GET /api/journals/mine`

Returns every journal owned by this organization.

```json
{
  "journals": [
    {
      "id": "cm...",
      "publisherId": "cm...",
      "title": "Journal of Example Studies",
      "slug": "journal-of-example-studies",
      "issn": "1234-567X",
      "description": null,
      "publisherName": "Example Press"
    }
  ]
}
```

### `GET /api/submissions/mine`

Returns every submission under any journal this organization owns,
regardless of status.

```json
{
  "submissions": [
    {
      "id": "cm...",
      "journalId": "cm...",
      "authorId": "cm...",
      "title": "A Study of Examples",
      "status": "ACCEPTED",
      "manuscriptUrl": "/v1/files/cm...",
      "submittedAt": "2026-07-01T12:00:00.000Z",
      "createdAt": "2026-06-20T09:00:00.000Z"
    }
  ]
}
```

Filter client-side on `status === "ACCEPTED"` to find manuscripts
ready to publish.

### `POST /api/submissions/:id/publish`

Publishes an accepted submission (`ACCEPTED` → `PUBLISHED`). This is
the only workflow action available via API key — every other
transition (accepting, rejecting, requesting revisions, etc.) is an
editorial decision and requires a logged-in `EDITOR`/`ADMIN` session.

```bash
curl -X POST https://<your-domain>/api/submissions/<id>/publish \
  -H "x-api-key: rpos_key_<...>"
```

Returns the updated submission on success. The submission's author is
notified of the status change the same way they would be if an editor
had published it from the dashboard.

## Errors

| Status | Body                            | Meaning                                                             |
| ------ | ------------------------------- | --------------------------------------------------------------------|
| 401    | `{"error":"MISSING_API_KEY"}`   | No `x-api-key` header was sent.                                     |
| 401    | `{"error":"INVALID_API_KEY"}`   | The key doesn't exist, or has been disabled.                        |
| 404    | `{"error":"NOT_FOUND"}`         | The submission doesn't exist, or belongs to a journal you don't own — the same 404 either way, so a key can't be used to probe for other organizations' submission IDs. |
| 409    | `{"error":"INVALID_TRANSITION"}`| The submission isn't in `ACCEPTED` status.                          |
| 429    | (rate-limit body)                | Too many requests — see below.                                      |

## Rate limits

Each API key has its own request budget (60 requests/minute by
default), tracked independently of your IP address. This means:

- Automated/scripted use of your key won't be throttled by other web
  traffic sharing your network's public IP.
- A single key can't consume the shared per-IP budget that other
  users on the same network rely on.

If a key is compromised, disable or regenerate it from Settings
immediately — there is no way to invalidate a single request in
flight, but a disabled/regenerated key stops authenticating on the
very next request.

## Rotation and revocation

- **Disable** stops the key from authenticating without losing the
  value — useful for a temporary pause.
- **Regenerate** replaces the key's value immediately (the old value
  stops working) and re-enables it if it was disabled.
- **Delete** removes the key entirely; generate a new one from
  scratch to restore API access.

Only one key exists per organization at a time — there's no
multi-key rotation scheme today. Regenerating is the intended way to
rotate a key on a schedule.
