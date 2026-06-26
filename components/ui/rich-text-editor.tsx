"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  readonly content: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

interface ToolbarButtonProps {
  readonly onClick: () => void;
  readonly isActive?: boolean;
  readonly disabled?: boolean;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  label,
  icon: Icon,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        isActive
          ? "bg-primary text-primary-foreground shadow-glow"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider(): React.JSX.Element {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

function Toolbar({ editor }: { editor: Editor }): React.JSX.Element {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-border bg-card/80 px-2 py-1.5 backdrop-blur">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        label="Bold"
        icon={Bold}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        label="Italic"
        icon={Italic}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        label="Strikethrough"
        icon={Strikethrough}
      />
      <Divider />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
        icon={Heading1}
      />
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
        icon={Heading2}
      />
      <Divider />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        label="Bullet list"
        icon={List}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        label="Numbered list"
        icon={ListOrdered}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        label="Quote"
        icon={Quote}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        label="Code block"
        icon={Code}
      />
      <Divider />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Undo"
        icon={Undo2}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Redo"
        icon={Redo2}
      />
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing the lesson…",
  className,
}: RichTextEditorProps): React.JSX.Element {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "rte-content focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
