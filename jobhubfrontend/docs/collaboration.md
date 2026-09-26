# Collaboration frontend

## Backend assessment and flow

The collaboration backend is project-based. It supports discovery, personal recommendations, owned projects, project-specific candidate suggestions, and memberships. There is no general People directory, chat, member removal, or membership reopening endpoint. The frontend keeps teammate discovery inside an owned project and redirects legacy People links to My projects.

| User intent               | Frontend                              | Backend under `/api/collab`                                                  |
| ------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| Find a project            | Explore → All projects / For you      | `GET /projects`, `GET /projects/for-me`                                      |
| Manage a project          | My projects → Created by me           | `GET /projects/mine`                                                         |
| Return to a joined team   | My projects → Joined                  | Active records from `GET /memberships/mine`                                  |
| Review a project          | Project → Overview                    | `GET /projects/{id}`                                                         |
| Review applicants         | Project → Requests                    | `GET /projects/{id}/memberships`                                             |
| Invite teammates          | Project → Recommended candidates      | `GET /projects/{id}/suggestions`, `POST /projects/{id}/invite`               |
| Join a project            | Overview → Request to join            | `POST /projects/{id}/request`                                                |
| Respond or track progress | Requests → To review / Sent / History | Personal and owner membership endpoints                                      |
| Update or close a project | Edit project / Settings               | `PUT /projects/{id}`, `PATCH /projects/{id}/status`, `DELETE /projects/{id}` |

Explore defaults to recruiting projects, as the backend does. Search filters expand on demand. For you uses the backend's best role when opening a project. Match explanations remain available under “Why this match”; the UI does not expose matching pool size or internal scoring metrics.

Created by me and Joined are distinct because `/projects/mine` returns only owned projects. Joined cards use membership fields and link to full project details without inventing status, capacity, or schedule information.

Collab uses a horizontal navigation row with Explore, My projects, Requests, and project creation. There is no section sidebar. Owners see Overview, Team, Requests, Recommended candidates, and Settings. Project sections use URLs so links, refresh, and browser navigation retain context. Overview contains the description, goals, and roles. Recommendations appear only in their dedicated section and load when it is opened and the project is recruiting with open seats and roles. The creation form’s “Create & find candidates” action opens the saved project directly at `?section=suggestions`; failed saves stay on the form. Ordinary edits return to the project overview. Owned project cards link directly to recommendations. Suggestions load independently of the membership list, so an applicant-list delay or failure does not hide candidates. Settings separates status changes and deletion from ordinary browsing. Visitors can review the team in Team, open roles in Overview, and their current membership or join action.

The backend returns the owner separately from `members`. `projectTeam` combines those fields into an owner-first, deduplicated roster. The owner occupies one seat and appears by name with Owner and, for the current user, You. Blank owner names fall back to the signed-in name only when the viewer ID matches the owner ID. The roster appears only in Team; filled roles show their assigned teammate.

Create and edit reuse the installed Markdown editor for project descriptions, goals, and role descriptions, with formatting controls and preview. Saves preserve Markdown. Detail pages render it through the existing GFM renderer, which skips raw HTML and filters unsafe link protocols. Discovery cards display short formatted excerpts without nested links or headings. Forms and project sections use spacing and separators instead of enclosing cards; compact active navigation and primary actions use the brand color. Keyboard focus and field borders have visible contrast, and reduced-motion preferences are respected.

To review combines personal invitations and join requests to owned projects. Sent combines personal join requests and invitations sent by the owner. History includes accepted and closed memberships. Navigation badges include incoming owner requests. Owner membership queries share a cache, retain successful project results after partial failures, and expose errors instead of showing a false empty inbox.

Collab has no decorative header, cover, or empty-state images. Existing member profile avatars and accessible tooltips remain.

## States and recovery

Empty lists show a short explanation and a relevant action: create a project, explore projects, reset filters, or edit role requirements. Joined projects, invitations, sent requests, history, owner requests, full teams, and closed recruitment each have distinct empty states. Loading and API failures remain separate from empty results.

Missing profile matching data offers profile review and refresh. Missing project matching data offers edit/save recovery. Recommendations are not limited to applicants: the backend searches discoverable candidate profiles with matching data, excluding the owner and all existing membership records (including requested, invited, active, declined, and left). Suggestions remain project-specific and owner-only, retain backend ordering, and offer role and location filters. Empty results offer role editing or clearing the location; projects without open roles prompt the owner to add one. Candidate cards include skill levels, match explanations, and a View details panel. The panel loads `/user/profile/{id}` only when opened, scoped to the viewer and candidate. It shows the full bio, skills, experience, education, and role-specific match reasons, with independent loading/error/empty states. The server action returns only the displayed profile fields, excluding email and phone numbers. A full-profile link opens separately so the project context stays intact. Inviting from the panel keeps the selected candidate and role and opens the optional-message dialog. Invitation submission rechecks project capacity, recruitment, role availability, and known memberships before calling the backend, then refreshes suggestions, team data, and inbox counts. Later role shortlists are conditional on earlier picks, as the backend matching algorithm specifies.

## Integration and constraints

Calls use `lib/actions/collaboration.ts` and the existing authenticated `fetchWithAuth` client. All collaboration endpoints require a candidate account. Types are in `types/api/collaboration.ts`; adapters in `lib/collaboration.ts` flatten detail and recommendation envelopes and normalize membership person fields. The detail adapter accepts the backend’s Jackson-serialized `owner` boolean as well as `isOwner`, without overwriting a legacy owner profile object. Owner rendering tests use the actual `owner` response field.

Team size is 2–20 including the owner. Weekly commitment is 1–80 whole hours; duration is at least one whole week. Roles have unique titles and cannot exceed teammate seats. Filled role titles cannot be changed or removed because the backend retains roles by normalized title. Clearing optional fields sends the backend removal flags; role IDs are omitted from save payloads.

Only recipients can accept pending invitations or requests. Either side can close a pending membership. Only active members can leave. Declined and left memberships cannot be reopened, so those actions retain confirmation. The backend rechecks recruiting status, capacity, and role availability on acceptance. Detail-page and owner-inbox acceptance controls also respect those constraints and show why acceptance is unavailable. The backend remains authoritative for concurrent changes. Messages are limited to 1,000 characters.

Queries are scoped to the signed-in user. Mutations invalidate collaboration queries, including after conflicts. Details, owner memberships, and visible suggestions refresh every 15 seconds; inbox data refreshes every 30 seconds. Focus refreshes results.

## Verification

Run `node --test tests/*.test.mjs`, `tsc --noEmit`, and ESLint on collaboration files. Render tests cover horizontal navigation, owner identity and session fallback, the Team route, absence of duplicated Overview content, Markdown formatting and unsafe content, editor labels, empty/error states, active joined memberships, request grouping, owner request badges, occupied roles, owner-only controls, and full/closed teams. Owner-inbox tests cover partial failures and empty project lists. Integration tests cover adapters, API routes, Markdown save payloads, create/edit destinations, filtering, numeric limits, and membership actions.

Live checks require a running backend, matching service, and two candidate accounts:

1. Create a project with roles and skills; verify it in Explore and Created by me.
2. Open Recommended candidates and invite a suggested candidate.
3. Accept from the candidate account; verify Joined, roster, capacity, and filled roles.
4. Request a role from For you; review and accept it as owner.
5. Check decline, withdrawal, leaving, and history.
6. Edit and clear optional fields; retain filled role titles.
7. Change recruitment status, check full-team states, and delete a disposable project.
8. Check phone-width layouts, keyboard navigation, unavailable matching, and API failures.

## Applicant search

Applicant pages other than Find Job have a compact navbar search based on the supplied command-palette reference. Opening or clearing it shows the latest active jobs and recruiting projects, with up to five results per group in backend date order. Typing filters both groups after a 250 ms debounce. Ctrl/Cmd+K focuses search; arrow keys choose a result, Enter opens it, and Escape closes the popover. Search terms are highlighted literally, so punctuation never becomes a regular expression.

The server action in `lib/actions/search.ts` uses the authenticated `/jobs` and `/collab/projects` endpoints concurrently. Each group has its own empty/error state; one endpoint failing preserves the other results. View all links retain the query on Find Job or Explore. Find Job keeps its dedicated labeled keyword/location form and existing URL filters.
