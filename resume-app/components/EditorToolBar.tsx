import { Editor } from '@tiptap/react';
import styles from './EditorToolBar.module.css';
import api from "../axiosConfig.ts";

type Props = {
  editor: Editor | null
}

export default function ToolBar({ editor }: Props) {
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
      </div>
    )
}
