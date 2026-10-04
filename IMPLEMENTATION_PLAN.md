# Implementation Plan

## Replace account login with a local profile

- Remove the signup and login requirement so a person can open and use the habit tracker without creating an account.
- Keep one profile and its habit data in the current browser profile using persistent local storage, so it is remembered after closing and reopening the app.
- Keep each browser profile's data separate. Data will not sync across devices or browsers, and anyone sharing the same browser profile may see it.
- Consider adding export/import so users can back up or manually move their data.
- Before changing production behavior, review how existing backend accounts and SQLite data should be handled. Do not delete or migrate existing records without an explicit decision.

## Implementation status

- The frontend now opens directly into the tracker and keeps a single profile, habits, completions, and notifications in the current browser's local storage (`chronos.local-profile.v1`).
- Profile name edits are saved locally. Existing browser data under the old keys is left in place and is not imported or deleted.
- Backend authentication, the SQLite database, and deployment configuration remain unchanged. Existing accounts and records are preserved but are no longer accessed by this frontend.
- Export/import is deferred. Add it before users need a supported way to back up or move local data.
