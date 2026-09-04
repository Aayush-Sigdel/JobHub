'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type {
  CreateEducationRequest,
  CreateExperienceRequest,
  EducationDto,
  ExperienceDto,
  SkillDto,
  SocialLinkDto,
  UpdateEducationRequest,
  UpdateExperienceRequest,
  UserProfileResponse,
} from "@/types/api/user";

async function refreshPlatformMatchingData() {
  try {
    await fetchWithAuth('/user/embedding/sync/platform', { method: 'POST' });
  } catch (error) {
    console.error('Failed to refresh platform matching data', error);
  }
}

async function refreshAllMatchingData() {
  try {
    await fetchWithAuth('/user/embedding/sync', { method: 'POST' });
  } catch (error) {
    console.error('Failed to refresh matching data', error);
  }
}

function revalidateMatchingViews() {
  revalidatePath('/candidate-profile');
  revalidatePath('/home');
  revalidatePath('/find-job');
}

// ─── Profile Updates ───────────────────────────────

export async function updateProfileAction(data: {
  name?: string;
  title?: string;
  bio?: string;
  location?: string;
  imageUrl?: string;
  skills?: { name: string; level: string }[];
  socialLinks?: { platform: string; url: string }[];
  contactNumbers?: string[];
}) {
  const result = await fetchWithAuth<UserProfileResponse>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (data.socialLinks) {
    await refreshAllMatchingData();
  } else {
    await refreshPlatformMatchingData();
  }
  revalidateMatchingViews();
  return result;
}

export async function updateBioAction(bio: string) {
  const result = await fetchWithAuth<UserProfileResponse>('/user/profile/bio', {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

// ─── Skills CRUD ────────────────────────────────────

export async function createSkillAction(data: { name: string; level: string }) {
  const result = await fetchWithAuth<SkillDto>('/user/profile/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function updateSkillAction(skillId: string, data: { name: string; level: string }) {
  const result = await fetchWithAuth<SkillDto>(`/user/profile/skills/${skillId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function deleteSkillAction(skillId: string) {
  await fetchWithAuth<void>(`/user/profile/skills/${skillId}`, {
    method: 'DELETE',
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
}

// ─── Contact Numbers ────────────────────────────────

export async function addContactNumberAction(contactNumber: string) {
  const result = await fetchWithAuth<UserProfileResponse>('/user/profile/contact-number', {
    method: 'POST',
    body: JSON.stringify({ contactNumber }),
  });
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteContactNumberAction(contactNumber: string) {
  await fetchWithAuth<UserProfileResponse>('/user/profile/contact-number', {
    method: 'DELETE',
    body: JSON.stringify({ contactNumber }),
  });
  revalidatePath('/candidate-profile');
}

// ─── Social Links ───────────────────────────────────

export async function addSocialLinkAction(data: { platform: string; url: string }) {
  const result = await fetchWithAuth<SocialLinkDto>('/user/profile/social-links', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await refreshAllMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function updateSocialLinkAction(
  linkId: string,
  data: { platform: string; url: string },
) {
  const result = await fetchWithAuth<SocialLinkDto>(`/user/profile/social-links/${linkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  await refreshAllMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function deleteSocialLinkAction(linkId: string) {
  await fetchWithAuth<void>(`/user/profile/social-links/${linkId}`, {
    method: 'DELETE',
  });
  await refreshAllMatchingData();
  revalidateMatchingViews();
}

// ─── Onboarding ─────────────────────────────────────

export async function completeOnboardingAction() {
  await fetchWithAuth<UserProfileResponse>('/user/profile/complete-onboarding', {
    method: 'POST',
  });
  
  await refreshAllMatchingData();
  revalidateMatchingViews();
}

// ─── Experience CRUD ────────────────────────────────

export async function createExperienceAction(data: CreateExperienceRequest) {
  const result = await fetchWithAuth<ExperienceDto>("/user/profile/experiences", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function updateExperienceAction(id: string, data: UpdateExperienceRequest) {
  const result = await fetchWithAuth<ExperienceDto>(`/user/profile/experiences/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function deleteExperienceAction(id: string) {
  await fetchWithAuth<void>(`/user/profile/experiences/${id}`, { method: "DELETE" });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return { success: true };
}

// ─── Education CRUD ─────────────────────────────────

export async function createEducationAction(data: CreateEducationRequest) {
  const result = await fetchWithAuth<EducationDto>("/user/profile/educations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function updateEducationAction(id: string, data: UpdateEducationRequest) {
  const result = await fetchWithAuth<EducationDto>(`/user/profile/educations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return result;
}

export async function deleteEducationAction(id: string) {
  await fetchWithAuth<void>(`/user/profile/educations/${id}`, { method: "DELETE" });
  await refreshPlatformMatchingData();
  revalidateMatchingViews();
  return { success: true };
}
