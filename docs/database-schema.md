# Database Schema

The full schema (tables, SQL, relationships, seeds) is maintained in a single place:

**`DATABASE_SCHEMA.md`**

This file exists so the folder matches the agreed structure. Do not copy schema details here, to avoid two versions drifting apart. Changes to the schema go through a "Contract change request" issue and a pull request that edits `DATABASE_SCHEMA.md` and adds a new numbered migration in `api/db/migrations/`.
