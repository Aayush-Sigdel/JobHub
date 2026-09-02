# JobHub API Endpoints

Based on the Swagger API documentation (v1.0.0, OAS 3.1).

## `user-controller`
- `GET` `/api/user/profile`
- `PUT` `/api/user/profile`
- `PUT` `/api/user/profile/title`
- `PUT` `/api/user/profile/social-links/{socialLinkId}`
- `DELETE` `/api/user/profile/social-links/{socialLinkId}`
- `PUT` `/api/user/profile/skills/{skillId}`
- `DELETE` `/api/user/profile/skills/{skillId}`
- `PUT` `/api/user/profile/location`
- `PUT` `/api/user/profile/image`
- `PUT` `/api/user/profile/experiences/{experienceId}`
- `DELETE` `/api/user/profile/experiences/{experienceId}`
- `PUT` `/api/user/profile/educations/{educationId}`
- `DELETE` `/api/user/profile/educations/{educationId}`
- `PUT` `/api/user/profile/bio`
- `POST` `/api/user/profile/social-links`
- `POST` `/api/user/profile/skills`
- `POST` `/api/user/profile/experiences`
- `POST` `/api/user/profile/educations`
- `POST` `/api/user/profile/contact-number`
- `DELETE` `/api/user/profile/contact-number`
- `POST` `/api/user/profile/complete-onboarding`
- `POST` `/api/user/embeddings/sync/{source}`
- `POST` `/api/user/embedding/sync`
- `POST` `/api/user/embedding/sync/platform`
- `GET` `/api/user/profile/{userId}`
- `GET` `/api/user/basic-info`
- `GET` `/api/user/basic-info/{userId}`

## `recruiter-controller`
- `PUT` `/api/recruiter/applications/{applicationId}/status`
- `GET` `/api/recruiter/jobs`
- `GET` `/api/recruiter/jobs/{jobId}/candidates`
- `GET` `/api/recruiter/jobs/{jobId}/candidates/{candidateId}/snapshots`

## `job-controller`
- `GET` `/api/jobs/{jobId}`
- `PUT` `/api/jobs/{jobId}`
- `DELETE` `/api/jobs/{jobId}`
- `GET` `/api/jobs`
- `POST` `/api/jobs`
- `POST` `/api/jobs/{jobId}/tab-switch`
- `POST` `/api/jobs/{jobId}/apply`
- `GET` `/api/jobs/my-applications`

## `task-controller`
- `POST` `/api/task/submit`
- `POST` `/api/task/sql/create`
- `POST` `/api/task/programming/create`
- `POST` `/api/task/design/create`
- `GET` `/api/task/sql/get`
- `GET` `/api/task/sql/getAll`
- `GET` `/api/task/programming/get`
- `GET` `/api/task/programming/getAll`
- `GET` `/api/task/design/get`
- `GET` `/api/task/design/getAll`

## `auth-controller`
- `POST` `/api/auth/verify-otp`
- `POST` `/api/auth/register`
- `POST` `/api/auth/refresh`
- `POST` `/api/auth/logout`
- `POST` `/api/auth/login`

