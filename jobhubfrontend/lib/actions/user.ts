'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";

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
  const result = await fetchWithAuth<any>('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  // Background sync for embeddings
  fetchWithAuth<any>('/user/embedding/sync/platform', { method: 'POST' }).catch(console.error);

  revalidatePath('/candidate-profile');
  revalidatePath('/home');
  return result;
}

export async function updateBioAction(bio: string) {
  const result = await fetchWithAuth<any>('/user/profile/bio', {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  });
  fetchWithAuth<any>('/user/embedding/sync/platform', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

// ─── Skills CRUD ────────────────────────────────────

export async function createSkillAction(data: { name: string; level: string }) {
  const result = await fetchWithAuth<any>('/user/profile/skills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  fetchWithAuth<any>('/user/embedding/sync/platform', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function updateSkillAction(skillId: string, data: { name: string; level: string }) {
  const result = await fetchWithAuth<any>(`/user/profile/skills/${skillId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  fetchWithAuth<any>('/user/embedding/sync/platform', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteSkillAction(skillId: string) {
  await fetchWithAuth<any>(`/user/profile/skills/${skillId}`, {
    method: 'DELETE',
  });
  fetchWithAuth<any>('/user/embedding/sync/platform', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
}

// ─── Contact Numbers ────────────────────────────────

export async function addContactNumberAction(contactNumber: string) {
  const result = await fetchWithAuth<any>('/user/profile/contact-number', {
    method: 'POST',
    body: JSON.stringify({ contactNumber }),
  });
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteContactNumberAction(contactNumber: string) {
  await fetchWithAuth<any>('/user/profile/contact-number', {
    method: 'DELETE',
    body: JSON.stringify({ contactNumber }),
  });
  revalidatePath('/candidate-profile');
}

// ─── Social Links ───────────────────────────────────

export async function addSocialLinkAction(data: { platform: string; url: string }) {
  const result = await fetchWithAuth<any>('/user/profile/social-links', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  fetchWithAuth<any>('/user/embedding/sync', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteSocialLinkAction(linkId: string) {
  await fetchWithAuth<any>(`/user/profile/social-links/${linkId}`, {
    method: 'DELETE',
  });
  fetchWithAuth<any>('/user/embedding/sync', { method: 'POST' }).catch(console.error);
  revalidatePath('/candidate-profile');
}

// ─── Onboarding ─────────────────────────────────────

export async function completeOnboardingAction() {
  await fetchWithAuth<any>('/user/profile/complete-onboarding', {
    method: 'POST',
  });
  
  // Also ensure embeddings are synced after onboarding completes
  await fetchWithAuth<any>('/user/embedding/sync', { method: 'POST' }).catch(console.error);
  
  revalidatePath('/home');
}

// ─── Experience CRUD ────────────────────────────────

export async function createExperienceAction(data: any) {
  const result = await fetchWithAuth<any>("/user/profile/experiences", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function updateExperienceAction(id: string, data: any) {
  const result = await fetchWithAuth<any>(`/user/profile/experiences/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteExperienceAction(id: string) {
  await fetchWithAuth<any>(`/user/profile/experiences/${id}`, { method: "DELETE" });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return { success: true };
}

// ─── Education CRUD ─────────────────────────────────

export async function createEducationAction(data: any) {
  const result = await fetchWithAuth<any>("/user/profile/educations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function updateEducationAction(id: string, data: any) {
  const result = await fetchWithAuth<any>(`/user/profile/educations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return result;
}

export async function deleteEducationAction(id: string) {
  await fetchWithAuth<any>(`/user/profile/educations/${id}`, { method: "DELETE" });
  await fetchWithAuth<any>("/user/embedding/sync/platform", { method: "POST" }).catch(console.error);
  revalidatePath('/candidate-profile');
  return { success: true };
}

