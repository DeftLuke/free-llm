# Security

## Never commit these files

| File / folder | Why |
|---------------|-----|
| `.env` | Contains `ENCRYPTION_KEY` — decrypts all stored provider API keys |
| `server/data/` | SQLite database with encrypted provider keys and admin password hash |
| `deploy/` | Local migration scripts and DB dumps (gitignored) |
| `*.db`, `*.db-wal`, `*.db-shm` | Database files |

## Before pushing to a public repo

```bash
git status
git diff
```

Confirm no real API keys, encryption keys, passwords, or server IPs appear in the diff.

## If you exposed an encryption key

1. Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update `.env` and restart the app
3. Re-add all provider API keys in the dashboard (old encrypted rows cannot be decrypted with a new key)
4. Regenerate your unified API key from the Keys page if it was leaked

## If you exposed a provider API key

Revoke and rotate the key at the provider's console (Google, Groq, OpenRouter, etc.).
