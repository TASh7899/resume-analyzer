import { EditorContent, useEditor } from "@tiptap/react";
import styles from './myEditor.module.css';

import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown"; 

import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";

import ToolBar from '../ToolBar/EditorToolBar.tsx';

export default function MyEditor() {
  
  const savedContent = localStorage.getItem("resume_editor_content");
  const initialContent = savedContent ? savedContent : "<p>Write your resume here</p>";

  const editor = useEditor({
    extensions: [
      // StarterKit already includes Bold, Italic, Lists, Blockquote, GapCursor, etc.
      StarterKit.configure({
        heading: false, // Disabled here because we manually configure it below
      }),
      Markdown,
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Underline,
      TextAlign.configure( { types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
    ],
    content: initialContent,
    
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      localStorage.setItem("resume_editor_content", html);
    }
  });

  return (
    <>
      <h1 className={styles.MainHeading}>Resume Builder</h1>
      <p className={styles.MainSubHeading}>- by Tanush Gupta and Yash Bansal -</p>
      <div className={styles.page}>
        <div className={styles.EditorWindow}>
          <ToolBar editor={editor} />
          <div className={styles.editor}>
            <div className="content">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
