# Collaboration frontend

## Backend assessment and flow

The collaboration backend is project-based. It supports discovery, personal recommendations, owned projects, project-specific candidate suggestions, and memberships. There is no general People directory, chat, member removal, or membership reopening endpoint. The frontend keeps teammate discovery inside an owned project and redirects legacy People links to My projects.

| User intent               | Frontend                                                           | Backend under `/api/collab`                                                  |
| ------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Find a project            | Explore → All projects / For you                                   | `GET /projects`, `GET /projects/for-me`                                      |
| Manage a project          | My projects → Created by me                                        | `GET /projects/mine`                                                         |
| Return to a joined team   | My projects → Joined                                               | Active records from `GET /memberships/mine`                                  |
| Review a project          | Project → Overview                                                 | `GET /projects/{id}`                                                         |
| Review applicants         | Project → Requests                                                 | `GET /projects/{id}/memberships`                                             |
| Invite teammates          | Project → Find teammates                                           | `GET /projects/{id}/suggestions`, `POST /projects/{id}/invite`               |
| Join a project            | Overview → Request to join                                         | `POST /projects/{id}/request`                                                |
| Respond or track progress | Requests → Invitations / Sent requests / For my projects / History | Personal and owner membership endpoints                                      |
| Update or close a project | Edit project / Settings                                            | `PUT /projects/{id}`, `PATCH /projects/{id}/status`, `DELETE /projects/{id}` |

Explore defaults to recruiting projects, as the backend does. Search filters expand on demand. For you uses the backend's best role when opening a project. Match explanations remain available under “Why this match”; the UI does not expose matching pool size or internal scoring metrics.

Created by me and Joined are distinct because `/projects/mine` returns only owned projects. Joined cards use membership fields and link to full project details without inventing status, capacity, or schedule information.

Owners see Overview, Requests, Find teammates, and Settings. Candidate suggestions load only when that section is opened and the project is recruiting with open seats. Settings separates status changes and deletion from ordinary browsing. Visitors see the team, open roles, and their current membership or join action.

## States and recovery

Empty lists show a short explanation and a relevant action: create a project, explore projects, reset filters, or edit role requirements. Joined projects, invitations, sent requests, history, owner requests, full teams, and closed recruitment each have distinct empty states. Loading and API failures remain separate from empty results.

Missing profile matching data offers profile review and refresh. Missing project matching data offers edit/save recovery. Suggestions remain project-specific and owner-only, retain backend ordering, and exclude existing memberships. Later role shortlists are conditional on earlier picks, as the backend matching algorithm specifies.

## Integration and constraints

Calls use `lib/actions/collaboration.ts` and the existing authenticated `fetchWithAuth` client. All collaboration endpoints require a candidate account. Types are in `types/api/collaboration.ts`; adapters in `lib/collaboration.ts` flatten detail and recommendation envelopes and normalize membership person fields.

Team size is 2–20 including the owner. Weekly commitment is 1–80 whole hours; duration is at least one whole week. Roles have unique titles and cannot exceed teammate seats. Filled role titles cannot be changed or removed because the backend retains roles by normalized title. Clearing optional fields sends the backend removal flags; role IDs are omitted from save payloads.

Only recipients can accept pending invitations or requests. Either side can close a pending membership. Only active members can leave. Declined and left memberships cannot be reopened, so those actions retain confirmation. The backend rechecks recruiting status, capacity, and role availability on acceptance. Detail-page acceptance controls also respect those constraints; inbox actions still rely on the backend's authoritative validation. Messages are limited to 1,000 characters.

Queries are scoped to the signed-in user. Mutations invalidate collaboration queries, including after conflicts. Details, owner memberships, and visible suggestions refresh every 15 seconds; inbox data refreshes every 30 seconds. Focus refreshes results.

## Verification

Run `node --test tests/*.test.mjs`, `tsc --noEmit`, and ESLint on collaboration files. Render tests cover navigation, empty/error states, active joined memberships, request grouping, owner-only controls, and full/closed teams. Integration tests cover adapters, API routes, mutation payloads, filtering, numeric limits, and membership actions.

Live checks require a running backend, matching service, and two candidate accounts:

1. Create a project with roles and skills; verify it in Explore and Created by me.
2. Open Find teammates and invite a suggested candidate.
3. Accept from the candidate account; verify Joined, roster, capacity, and filled roles.
4. Request a role from For you; review and accept it as owner.
5. Check decline, withdrawal, leaving, and history.
6. Edit and clear optional fields; retain filled role titles.
7. Change recruitment status, check full-team states, and delete a disposable project.
8. Check phone-width layouts, keyboard navigation, unavailable matching, and API failures.

## Applicant search

Applicant pages other than Find Job have a compact navbar search based on the supplied command-palette reference. Opening or clearing it shows the latest active jobs and recruiting projects, with up to five results per group in backend date order. Typing filters both groups after a 250 ms debounce. Ctrl/Cmd+K focuses search; arrow keys choose a result, Enter opens it, and Escape closes the popover. Search terms are highlighted literally, so punctuation never becomes a regular expression.

The server action in `lib/actions/search.ts` uses the authenticated `/jobs` and `/collab/projects` endpoints concurrently. Each group has its own empty/error state; one endpoint failing preserves the other results. View all links retain the query on Find Job or Explore. Find Job keeps its dedicated labeled keyword/location form and existing URL filters.
