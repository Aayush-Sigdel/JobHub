"use client";
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";

export default function SQLEditor({ code, setCode }: { code: string; setCode: (val: string) => void }) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-gray-100 p-2 text-sm font-semibold border-b">SQL Query Editor</div>
      <div className="flex-1 overflow-auto"><CodeMirror value={code} height="100%" extensions={[sql()]} onChange={setCode} className="h-full" /></div>
    </div>
  );
}
