import { EditorContent, useEditor } from "@tiptap/react";
import styles from './myEditor.module.css';

import {useState} from "react";

import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown"; 

import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";

import ToolBar from '../ToolBar/EditorToolBar.tsx';

import AdModal from '../AdModal/AdModal.tsx';

export default function MyEditor() {
  
  const savedContent = localStorage.getItem("resume_editor_content");
  const initialContent = savedContent ? savedContent : "<p>Write your resume here</p>";
  const [hasWatchedAd, setHasWatchedAd] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
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

    {!hasWatchedAd && (
      <AdModal onComplete={() => setHasWatchedAd(true)} />
    )}

      <h1 className={styles.MainHeading}>Resume Builder</h1>
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
