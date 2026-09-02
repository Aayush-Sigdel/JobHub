'use server';

import { fetchWithAuth } from "@/lib/service-api";
import { revalidatePath } from "next/cache";
import type { ApplicationStatus } from "@/types/api/jobs";

export async function updateApplicationStatusAction(applicationId: string, status: ApplicationStatus) {
  const result = await fetchWithAuth(`/recruiter/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  revalidatePath('/dashboard');
  revalidatePath('/candidates');
  return result;
}
