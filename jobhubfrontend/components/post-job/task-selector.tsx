"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
}

interface TaskSelectorProps {
  designTasks: Task[];
  programmingTasks: Task[];
  sqlTasks: Task[];
  selectedDesignId: string | null;
  setSelectedDesignId: (id: string | null) => void;
  selectedProgrammingId: string | null;
  setSelectedProgrammingId: (id: string | null) => void;
  selectedSqlId: string | null;
  setSelectedSqlId: (id: string | null) => void;
}

export function TaskSelector({
  designTasks, programmingTasks, sqlTasks,
  selectedDesignId, setSelectedDesignId,
  selectedProgrammingId, setSelectedProgrammingId,
  selectedSqlId, setSelectedSqlId
}: TaskSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="border border-[#e4e5e7] p-6 bg-[#fafafa] rounded-sm">
        <h4 className="font-bold text-[#404145] mb-2">Design Task</h4>
        {designTasks.length > 0 ? (
          <Select value={selectedDesignId || "none"} onValueChange={(val) => setSelectedDesignId(val === "none" ? null : val)}>
            <SelectTrigger className="w-full h-12 bg-white"><SelectValue placeholder="Select a Design Task (Optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {designTasks.map(t => (<SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-[#74767e]">No design tasks created. <Link href="/post-task/css" className="text-[#1dbf73] font-bold">Create one</Link></p>
        )}
      </div>

      <div className="border border-[#e4e5e7] p-6 bg-[#fafafa] rounded-sm">
        <h4 className="font-bold text-[#404145] mb-2">Programming Task</h4>
        {programmingTasks.length > 0 ? (
          <Select value={selectedProgrammingId || "none"} onValueChange={(val) => setSelectedProgrammingId(val === "none" ? null : val)}>
            <SelectTrigger className="w-full h-12 bg-white"><SelectValue placeholder="Select a Programming Task (Optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {programmingTasks.map(t => (<SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-[#74767e]">No programming tasks created. <Link href="/post-task/css" className="text-[#1dbf73] font-bold">Create one</Link></p>
        )}
      </div>

      <div className="border border-[#e4e5e7] p-6 bg-[#fafafa] rounded-sm">
        <h4 className="font-bold text-[#404145] mb-2">SQL Task</h4>
        {sqlTasks.length > 0 ? (
          <Select value={selectedSqlId || "none"} onValueChange={(val) => setSelectedSqlId(val === "none" ? null : val)}>
            <SelectTrigger className="w-full h-12 bg-white"><SelectValue placeholder="Select a SQL Task (Optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {sqlTasks.map(t => (<SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-[#74767e]">No SQL tasks created. <Link href="/post-task/css" className="text-[#1dbf73] font-bold">Create one</Link></p>
        )}
      </div>
    </div>
  );
}
