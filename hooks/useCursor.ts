"use client";

export type CursorState = "default" | "link" | "view" | "hidden" | "native";

export interface CursorOptions {
  type?: CursorState;
  text?: string;
}

export interface CursorProps {
  "data-cursor"?: CursorState;
  "data-cursor-text"?: string;
}

/**
 * useCursor hook:
 * Enables any component to opt in to custom cursor states.
 *
 * Usage options:
 * 1. Pass state string:
 *    <button {...useCursor("link")}>Hover me</button>
 * 2. Pass options with custom label:
 *    <div {...useCursor({ type: "view", text: "EXPLORE" })}>Card</div>
 * 3. Or simply use standard data attributes in HTML/JSX directly:
 *    <a data-cursor="link">Link</a>
 *    <article data-cursor="view">Project</article>
 */
export function useCursor(
  options: CursorState | CursorOptions = "link",
  customText?: string
): CursorProps {
  if (typeof options === "string") {
    return {
      "data-cursor": options,
      ...(customText ? { "data-cursor-text": customText } : {}),
    };
  }

  const { type = "link", text } = options || {};
  return {
    "data-cursor": type,
    ...(text || customText ? { "data-cursor-text": text || customText } : {}),
  };
}

export default useCursor;
