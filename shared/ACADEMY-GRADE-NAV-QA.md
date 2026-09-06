# Academy Grade Navigation QA

## Scope

Grade 2, Grade 3 and Grade 4 shared top navigation.

## Static QA — PASS

| Check | Grade 2 | Grade 3 | Grade 4 |
|---|---|---|---|
| Shared nav stylesheet loaded | PASS | PASS | PASS |
| Shared nav JavaScript loaded | PASS | PASS | PASS |
| `data-grade` is correct | PASS | PASS | PASS |
| Academy link is relative and points to `../academy.html` | PASS | PASS | PASS |
| Logout button exists | PASS | PASS | PASS |
| Logout confirmation exists | PASS | PASS | PASS |
| Supabase auth local-storage keys are cleared | PASS | PASS | PASS |
| Session storage is cleared | PASS | PASS | PASS |
| Redirect after logout targets `../login.html?reason=logout` | PASS | PASS | PASS |
| Duplicate nav mount is prevented | PASS | PASS | PASS |
| Mobile navigation CSS exists | PASS | PASS | PASS |

## Route QA

The canonical grade entry points are:

- `/grade2/` → `grade2/index.html`
- `/grade3/` → `grade3/index.html`
- `/grade4/` → `grade4/index.html`

Root compatibility routes also exist:

- `/grade2.html` → `grade2/`
- `/grade3.html` → `grade3/`
- `/grade4.html` → `grade4/`

## Result

**Static navigation integration: PASS.**

The same shared navigation implementation is loaded by all three grade entry pages. The Academy button uses a relative path, which is correct from each `/gradeX/` directory. Logout clears browser auth/session storage and redirects to the login page.

## Runtime caveat

This report is source-level/static QA. A real browser session on the deployed custom domain is still required to verify the rendered button appearance, click behavior, authentication state transition, and cache/service-worker behavior end-to-end.