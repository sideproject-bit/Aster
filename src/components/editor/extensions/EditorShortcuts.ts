import { Extension } from "@tiptap/core";

// App-level shortcuts on top of StarterKit's built-in ones (bold/italic/undo/etc.).
// Mod-S (save) is handled outside the editor — see Editor.tsx — since it needs to
// reach the page's save function, not just editor state.
export const EditorShortcuts = Extension.create({
  name: "editorShortcuts",

  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        this.editor.chain().focus().insertContent("[[").run();
        return true;
      },
    };
  },
});
