import React from "react";
import { fetchWithAuth } from "@/lib/service-api";
import SQLArenaClient from "./_components/SQLArenaClient";

export interface SQLTaskDto {
  id: string;
  title: string;
  instructions: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  scope: "PUBLIC" | "PRIVATE";
  createdBy: string;
}

export default async function SQLArenaPage() {
  const tasks = await fetchWithAuth<SQLTaskDto[]>("/task/sql/getAll");
  return <SQLArenaClient tasks={tasks} />;
}
