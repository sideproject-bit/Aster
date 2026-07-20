import Heading from "@tiptap/extension-heading";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { HeadingView } from "./HeadingView";

// Adds a fold/unfold toggle to each heading (Namuwiki-style section collapsing).
// Levels are restricted to 2-5: H1 is reserved for the document title elsewhere,
// and capping at H5 keeps the auto-generated table of contents numbering sane.
export const CollapsibleHeading = Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(HeadingView);
  },
}).configure({ levels: [2, 3, 4, 5] });
