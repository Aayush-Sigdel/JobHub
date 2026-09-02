import { OutputData } from "@editorjs/editorjs";

export function convertEditorJsToPlainText(data: OutputData | string | null | undefined): string {
  if (!data) return "";

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (parsed.blocks) return convertEditorJsToPlainText(parsed);
    } catch {
      return data;
    }
    return data;
  }

  if (!data.blocks || !Array.isArray(data.blocks)) return "";

  return data.blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "header":
          return block.data.text || "";
        case "list":
          if (block.data.style === "ordered") {
            return (block.data.items || []).map((item: string, i: number) => `${i + 1}. ${item}`).join("\n");
          } else {
            return (block.data.items || []).map((item: string) => `• ${item}`).join("\n");
          }
        case "quote":
          return block.data.text ? `"${block.data.text}"` : "";
        default:
          return block.data.text || "";
      }
    })
    .map(text => text.replace(/<[^>]*>?/gm, ""))
    .join("\n\n")
    .trim();
}
