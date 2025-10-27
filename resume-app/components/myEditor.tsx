import { EditorContent, useEditor } from "@tiptap/react";
import styles from './myEditor.module.css';
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Underline from "@tiptap/extension-underline"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Blockquote from "@tiptap/extension-blockquote"
import TextAlign from "@tiptap/extension-text-align"
import Gapcursor from "@tiptap/extension-gapcursor"


import ToolBar from './EditorToolBar.tsx';

export default function MyEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({heading: false}),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      HorizontalRule,
      Blockquote,
      TextAlign.configure( { types: ["heading", "paragraph"] }),
      Gapcursor,
    ],
    content: "<p>Write your resume here</p>"
  });


  return (
    <div className={styles.page}>
      <div className={styles.EditorWindow}>
        <ToolBar editor={editor} />
        <div className={styles.editor}>
          <EditorContent editor={editor} />
        </div>
      </div>
      
    </div>
  )

}

