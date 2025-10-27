import { Editor } from '@tiptap/react';
import styles from './EditorToolBar.module.css';
import api from "../axiosConfig.ts";
import AiPanel from './aiPanel.tsx';
import { useState } from "react";

type Props = {
  editor: Editor | null;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export default function ToolBar({ editor }: Props) {

  const [showAiPanel, setShowAiPanel] = useState(false);

  if (!editor) return;
  const downloadPDF = async () => {
    try {
      const content = editor.getHTML();
      const res = await api.post("/pdf/download", { content }, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log("successfully downloaded pdf");
    } catch (err) {
      console.error("Error downloading pdf:", err);
    }
  };


  const headingChange = (event) => {
    const level = event.target.value;

    if (level == "") {
      editor.chain().focus().setParagraph().run();
    } else {
      const levelValue = Number(level) as HeadingLevel;
      editor.chain().focus().toggleHeading({ level: levelValue}).run();
    };
  }

  return (
    <div>
      <div className={styles.toolbar}>

        <div>
          <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
          <select name="heading-size" onChange={headingChange} className={styles.toolbarOptions} defaultValue="">
            <option value="">Paragraph</option>
            <option value="1">largest</option>
            <option value="2">large</option>
            <option value="3">medium</option>
            <option value="4">small</option>
          </select>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</button>
          <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>←</button>
          <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>→</button>
          <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>⯀</button>
          <button onClick={() => editor.chain().focus().undo().run()}>undo</button>
          <button onClick={() => editor.chain().focus().redo().run()}>redo</button>
        </div>

        <div>
          <button onClick={downloadPDF}>Download</button>
          <button onClick={() => setShowAiPanel(!showAiPanel)}>AI</button>
        </div>

      </div>
      { showAiPanel && <AiPanel editor={editor} />}
    </div>
  );
}

