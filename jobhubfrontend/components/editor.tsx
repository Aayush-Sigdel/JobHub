"use client";

import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
// @ts-ignore
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";

interface EditorProps {
  id?: string;
  placeholder?: string;
}

export default function Editor({ id = "editorjs", placeholder }: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ejInstance.current === null && editorRef.current) {
      ejInstance.current = new EditorJS({
        holder: editorRef.current,
        placeholder: placeholder || "Start writing here...",
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true
          }
        },
        autofocus: false,
      });
    }
    
    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, [placeholder]);

  return (
    <div className="rounded-md border border-input bg-background overflow-hidden min-h-[200px] w-full">
      <div ref={editorRef} className="px-4 py-2 w-full prose max-w-none" />
    </div>
  );
}
