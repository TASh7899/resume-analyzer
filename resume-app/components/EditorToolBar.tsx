import { Editor } from '@tiptap/react';
import styles from './EditorToolBar.module.css';
import api from "../axiosConfig.ts";

import { useState, useEffect } from "react";

type Props = {
  editor: Editor | null
}

export default function ToolBar({ editor }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState("");

  useEffect(() => {
        if (editor) {
          editor.setEditable(!isLoading);
        }
      }, [isLoading, editor])

  if (!editor) return null

    const downloadPDF = async () => {
      try {
        const content = editor.getHTML();
        const res = await api.post(
          "/pdf/download",
          { content },
          { responseType: "blob" }
        );

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "resume.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        console.log("successfully downloaded pdf");
      } catch(err) {
        console.error("Error downloading pdf:", err);
      }
    }

    ;

    const generateContent = async (prompt: string) => {
      if (!editor || isLoading) {
        return;
      }
      setIsLoading(true);
      const extra = `Return ONLY clean HTML that can be inserted into a Tiptap editor. Do NOT include any extra commentary like "Here is your answer" or explanations. Do not add placeholders or unnecessary line breaks. Use only valid HTML tags supported by Tiptap. Keep it minimal and compact.`;
      const fullPrompt = `${prompt} ${extra}`

      try {
        const res = await api.post('/pdf/generate', { prompt: fullPrompt });

        if (res.data) {
          const htmlResponse = res.data.text;
          const cleanhtml = htmlResponse.replace(/\n\s*/g, "").replace(/<p><\/p>/g, "").replace(/<\/?(html|body)>/g, "").trim()
          editor.chain().focus().insertContent(cleanhtml).run();
        }
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false);
      }
    }

    return (
      <div className={styles.toolbar}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</button>
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}>←</button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}>→</button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}>⯀</button>

        <button onClick={() => downloadPDF()}>download</button>
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button onClick={() => generateContent(prompt)} disabled={isLoading}> {isLoading ? "Generating..." : "Generate"}</button>
      </div>
    )
}
