# Collaboration projects frontend

The candidate navigation's **Collaboration** link enters a dedicated section at `/collaborators`, which redirects to `/collaborators/explore`. A persistent sidebar (horizontal navigation on smaller screens) provides real page links:

- `/collaborators/explore`: project search and filters.
- `/collaborators/for-you`: gap-based recommendations with a suggested role.
- `/collaborators/my-projects`: owned projects and pending counts.
- `/collaborators/inbox`: invitations, sent requests, membership history, and requests for owned projects.
- `/collaborators/people`: the existing collaborator directory.

Each page has its own heading and URL and supports browser back/forward navigation. Legacy `?tab=` links redirect to the corresponding page. The section navigation remains visible on project detail, create, and edit pages.

Create projects at `/collaborators/projects/new`. Project detail and its squad builder live at `/collaborators/projects/[id]`; editing is at `/collaborators/projects/[id]/edit`.

## Integration

All API calls are in `lib/actions/collaboration.ts`, using the frontend's existing authenticated `fetchWithAuth` mechanism and configured API base URL. No backend implementation is included or changed. Requests target the `/collab` endpoints from the supplied frontend guide.

`types/api/collaboration.ts` holds the expected wire types. The supplied guide includes a complete suggestions example but does **not** include full project, membership, or create/update payload examples. The referenced Postman collection and `/api/collab` backend controllers are absent from this checkout. Consequently these portions need confirmation against the deployed API:

- Project fields use `id`, `title`, `description`, `teamSize`, `workplaceType`, `location`, `commitmentHoursPerWeek`, and `roles`.
- Roles use `id`, `title`, `description`, and `requiredSkills`. Filled state supports `filled` / `isFilled`, or an active roster entry with that `roleId`.
- Project and membership lists are JSON arrays. Recommended projects expose project fields alongside `bestRoleId`, optional `bestRoleTitle`, and optional `explanation`.
- Membership display fields use `projectTitle`, `name`, `imageUrl`, and `roleTitle` alongside the documented IDs and lifecycle fields.
- Project owner display uses `owner` or `ownerId` / `ownerName`.

Match these types to the actual payloads if the API uses different field names or envelopes. The frontend displays actual API errors and does not substitute demo data.

## Freshness and membership rules

Collaboration queries are scoped by signed-in user. Every membership mutation invalidates project lists, details, memberships, and suggestions, including after conflicts. Owner details and suggestions poll every 15 seconds while visible, and the inbox polls every 30 seconds. Window focus also refreshes data. The ranking slider debounces requests by 350 ms; roles and candidates retain the order returned by the API.

Only recipients can accept invitations or requests. Owners cannot remove active members. Declined and left memberships have no further actions. Edit forms retain role IDs and submit the complete role list, preventing removal of filled roles and respecting the owner's seat.

The navigation inbox badge uses memberships and a per-user localStorage seen timestamp. Pending invitations stay badged until acted on. New active, declined, and left states count as updates. No notification or messaging API is assumed; profiles provide contact details.

## Verification

Run `node --test tests/*.test.mjs`, `tsc --noEmit`, and ESLint on the collaboration files.

With the deployed API and two candidate accounts, check:

1. Create a three-person project with two roles and required skills; verify it appears in Explore and My projects.
2. Adjust the squad builder slider; confirm requests carry `lambda` and retain API ranking order.
3. Invite another candidate. The owner sees Withdraw; the invited candidate sees Accept / Decline in the inbox.
4. Accept from the second account; verify the owner's roster, seat count, pending count, and remaining suggestions refresh.
5. Send and accept a join request in the reverse direction. Verify the sender cannot accept their own request.
6. Decline a request and check the sender's inbox status and update badge.
7. Leave an active team and verify the role reopens; the owner must have no removal action.
8. Edit a project with a filled role, change status, and delete a disposable project through its confirmation.
9. Check missing matching data (`409`), creation outage (`503` with retained form and retry), and full/filled-role conflicts.
10. Check mobile and dark-mode layouts; confirm signed-out users and employers cannot access project routes.
