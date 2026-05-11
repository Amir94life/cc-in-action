import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => { cleanup(); });

// ---------- getToolLabel unit tests ----------

describe("getToolLabel – str_replace_editor", () => {
  test("create command", () => {
    const result = getToolLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" });
    expect(result.icon).toBe("create");
    expect(result.text).toBe("Creating `App.jsx`");
  });

  test("str_replace command", () => {
    const result = getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/App.jsx" });
    expect(result.icon).toBe("edit");
    expect(result.text).toBe("Editing `App.jsx`");
  });

  test("insert command", () => {
    const result = getToolLabel("str_replace_editor", { command: "insert", path: "/components/Button.tsx" });
    expect(result.icon).toBe("edit");
    expect(result.text).toBe("Editing `Button.tsx`");
  });

  test("view command", () => {
    const result = getToolLabel("str_replace_editor", { command: "view", path: "/README.md" });
    expect(result.icon).toBe("view");
    expect(result.text).toBe("Reading `README.md`");
  });

  test("undo_edit command", () => {
    const result = getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" });
    expect(result.icon).toBe("edit");
    expect(result.text).toBe("Undoing edit in `App.jsx`");
  });

  test("unknown command falls back to edit", () => {
    const result = getToolLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" });
    expect(result.icon).toBe("edit");
    expect(result.text).toBe("Updating `App.jsx`");
  });

  test("missing path shows generic 'file'", () => {
    const result = getToolLabel("str_replace_editor", { command: "create" });
    expect(result.text).toBe("Creating file");
  });

  test("extracts filename from nested path", () => {
    const result = getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/components/ui/Button.tsx" });
    expect(result.text).toBe("Editing `Button.tsx`");
  });
});

describe("getToolLabel – file_manager", () => {
  test("delete command", () => {
    const result = getToolLabel("file_manager", { command: "delete", path: "/src/Old.jsx" });
    expect(result.icon).toBe("delete");
    expect(result.text).toBe("Deleting `Old.jsx`");
  });

  test("rename command with new_path", () => {
    const result = getToolLabel("file_manager", { command: "rename", path: "/src/Old.jsx", new_path: "/src/New.jsx" });
    expect(result.icon).toBe("move");
    expect(result.text).toBe("Moving `Old.jsx` → `New.jsx`");
  });

  test("rename command without new_path", () => {
    const result = getToolLabel("file_manager", { command: "rename", path: "/src/Old.jsx" });
    expect(result.icon).toBe("move");
    expect(result.text).toBe("Moving `Old.jsx`");
  });
});

describe("getToolLabel – unknown tool", () => {
  test("falls back to tool name as text", () => {
    const result = getToolLabel("some_other_tool", {});
    expect(result.icon).toBe("generic");
    expect(result.text).toBe("some_other_tool");
  });
});

// ---------- ToolCallBadge rendering tests ----------

describe("ToolCallBadge", () => {
  test("shows spinner and action text while in-progress", () => {
    render(
      <ToolCallBadge
        tool={{ state: "call", toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" } }}
      />
    );
    screen.getByText("Creating"); // throws if not found
    screen.getByText("App.jsx");
    expect(document.querySelector(".animate-spin")).not.toBeNull();
  });

  test("shows static icon when result is present", () => {
    render(
      <ToolCallBadge
        tool={{ state: "result", toolName: "str_replace_editor", args: { command: "str_replace", path: "/App.jsx" }, result: "ok" }}
      />
    );
    screen.getByText("Editing");
    screen.getByText("App.jsx");
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  test("renders filename in its own span", () => {
    render(
      <ToolCallBadge
        tool={{ state: "call", toolName: "str_replace_editor", args: { command: "create", path: "/Card.jsx" } }}
      />
    );
    const filenameSpan = screen.getByText("Card.jsx");
    expect(filenameSpan.tagName).toBe("SPAN");
    expect(filenameSpan.className).toContain("font-mono");
  });

  test("renders file_manager delete badge", () => {
    render(
      <ToolCallBadge
        tool={{ state: "result", toolName: "file_manager", args: { command: "delete", path: "/Old.jsx" }, result: { success: true } }}
      />
    );
    screen.getByText("Deleting");
    screen.getByText("Old.jsx");
  });

  test("renders file_manager move badge", () => {
    render(
      <ToolCallBadge
        tool={{ state: "call", toolName: "file_manager", args: { command: "rename", path: "/Old.jsx", new_path: "/New.jsx" } }}
      />
    );
    screen.getByText(/Moving/);
    screen.getByText("Old.jsx");
    screen.getByText("New.jsx");
  });
});
