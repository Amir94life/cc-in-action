"use client";

import { Loader2, FilePlus, FilePen, FileSearch, FileX, FolderInput } from "lucide-react";

export interface ToolInvocationData {
  state: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ToolCallBadgeProps {
  tool: ToolInvocationData;
}

function getFileName(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  return path.split("/").filter(Boolean).pop() ?? path;
}

export type ToolLabelIcon = "create" | "edit" | "view" | "delete" | "move" | "generic";

export interface ToolLabel {
  icon: ToolLabelIcon;
  text: string;
}

export function getToolLabel(toolName: string, args?: Record<string, unknown>): ToolLabel {
  if (toolName === "str_replace_editor") {
    const command = args?.command as string | undefined;
    const file = getFileName(args?.path);
    const label = file ? `\`${file}\`` : "file";

    switch (command) {
      case "create":
        return { icon: "create", text: `Creating ${label}` };
      case "str_replace":
      case "insert":
        return { icon: "edit", text: `Editing ${label}` };
      case "view":
        return { icon: "view", text: `Reading ${label}` };
      case "undo_edit":
        return { icon: "edit", text: `Undoing edit in ${label}` };
      default:
        return { icon: "edit", text: `Updating ${label}` };
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command as string | undefined;
    const file = getFileName(args?.path);
    const newFile = getFileName(args?.new_path);
    const label = file ? `\`${file}\`` : "file";

    switch (command) {
      case "delete":
        return { icon: "delete", text: `Deleting ${label}` };
      case "rename":
        return {
          icon: "move",
          text: newFile ? `Moving \`${file}\` → \`${newFile}\`` : `Moving ${label}`,
        };
      default:
        return { icon: "edit", text: `Managing ${label}` };
    }
  }

  return { icon: "generic", text: toolName };
}

const iconMap: Record<ToolLabelIcon, React.ElementType> = {
  create: FilePlus,
  edit: FilePen,
  view: FileSearch,
  delete: FileX,
  move: FolderInput,
  generic: FilePen,
};

function renderText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <span key={i} className="font-mono font-medium text-neutral-800">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    )
  );
}

export function ToolCallBadge({ tool }: ToolCallBadgeProps) {
  const isDone = tool.state === "result" && tool.result != null;
  const { icon, text } = getToolLabel(tool.toolName, tool.args);
  const Icon = iconMap[icon];

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
      )}
      <span className="text-neutral-600">{renderText(text)}</span>
    </div>
  );
}
