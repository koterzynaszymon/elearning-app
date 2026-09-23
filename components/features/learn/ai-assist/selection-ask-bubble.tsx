"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";

interface SelectionAskBubbleProps {
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly onAsk: (selectedText: string) => void;
}

interface BubblePosition {
  readonly top: number;
  readonly left: number;
}

/**
 * Floating "Explain" button that appears above whatever text the student
 * highlights inside `containerRef`.
 */
export function SelectionAskBubble({
  containerRef,
  onAsk,
}: SelectionAskBubbleProps): React.ReactPortal | null {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<BubblePosition | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateFromSelection = useCallback((): void => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      setPosition(null);
      return;
    }

    const selected = selection.toString().trim();
    if (selected.length === 0) {
      setPosition(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setPosition(null);
      return;
    }

    setText(selected);
    setPosition({ top: rect.top, left: rect.left + rect.width / 2 });
  }, [containerRef]);

  useEffect(() => {
    function handlePointerUp(): void {
      window.setTimeout(updateFromSelection, 0);
    }
    function hide(): void {
      setPosition(null);
    }

    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("keyup", handlePointerUp);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("keyup", handlePointerUp);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [updateFromSelection]);

  if (!mounted || !position) return null;

  return createPortal(
    <button
      type="button"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
      onClick={() => {
        onAsk(text);
        window.getSelection()?.removeAllRanges();
        setPosition(null);
      }}
      className="z-50 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Explain
    </button>,
    document.body,
  );
}
