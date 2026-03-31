import { EditorContent, useEditor } from "@tiptap/react";
import styles from './myEditor.module.css';
import AdUnit from '../AdUnit/AdUnit.tsx';

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
  
  const savedContent = typeof window !== 'undefined' ? localStorage.getItem("resume_editor_content") : null;
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
      {/* The Ad Modal Overlay */}
      {!hasWatchedAd && (
        <AdModal onComplete={() => setHasWatchedAd(true)} />
      )}

      {/* The Background Content Wrapper */}
      {/* This locks the background from scrolling and blurs everything safely on all devices */}
      <div style={{
        filter: hasWatchedAd ? 'none' : 'blur(6px)',
        pointerEvents: hasWatchedAd ? 'auto' : 'none',
        userSelect: hasWatchedAd ? 'auto' : 'none',
        height: hasWatchedAd ? 'auto' : '100vh',
        overflow: hasWatchedAd ? 'visible' : 'hidden'
      }}>
        
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
        
        <div style={{ width: 'min(1100px, 95vw)', margin: '0 auto 15px auto', minHeight: '50px' }}>
          <AdUnit slotId="8127864116" />
        </div>

      </div>
    </>
  )
}
