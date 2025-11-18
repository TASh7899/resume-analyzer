import { Editor } from '@tiptap/react';
import type { ChangeEvent } from 'react';
import styles from './EditorToolBar.module.css';
import api from "../../axiosConfig.ts";
import AiPanel from '../AiPanel/aiPanel.tsx';
import { useCallback, useState } from "react";

import { BiAlignMiddle, BiAlignLeft, BiAlignRight, BiBold, BiItalic, 
BiUnderline, BiListUl, BiListOl, BiMoveHorizontal, BiUndo, BiRedo, BiLinkAlt, BiDownload } from "react-icons/bi";
import { BsStars } from "react-icons/bs";

import { BubbleMenu } from "@tiptap/react/menus";

type Props = {
  editor: Editor | null;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export default function ToolBar({ editor }: Props) {

  const [showAiPanel, setShowAiPanel] = useState(false);
  const [downloading, setdownloading] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!editor) return;
    try {
      setdownloading(true);
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
      setdownloading(false);
    } catch (err) {
      console.error("Error downloading pdf:", err);
      setdownloading(false);
    }
  }, [editor]);


  const headingChange = useCallback( (event: ChangeEvent<HTMLSelectElement>) => {
  if (!editor) return;
    const level = event.target.value;

    if (level == "") {
      editor.chain().focus().setParagraph().run();
    } else {
      const levelValue = Number(level) as HeadingLevel;
      editor.chain().focus().toggleHeading({ level: levelValue}).run();
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousURL = editor.getAttributes('link')?.href ?? " ";
    let url = window.prompt('Enter URL', previousURL);

    if (url == null) {
      return;
    }

    if (url == "") {
      editor.chain().extendMarkRange('link').unsetLink().run()
      editor.commands.focus();
      return;
    }

    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      url = "https://" + url;
    }

    editor.chain().extendMarkRange('link').setLink({ href: url }).run()
    editor.commands.focus();
  }, [editor]);


  if (!editor) {
    return <div className={styles.ToolBarIsDisabled}>Loading editor…</div>;
  }

  return (
    <div>
      <div className={styles.toolbar}>

        <div className={styles.ToolBarLeftBtns}>
          <button onClick={() => editor.chain().focus().toggleBold().run()}><BiBold size={20}/></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}><BiItalic size={20}/></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}><BiUnderline size={20}/></button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}><BiListUl size={20}/></button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><BiListOl size={20}/></button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()}><BiMoveHorizontal size={20}/></button>
          <button onClick={() => editor.chain().focus().setTextAlign("left").run()}><BiAlignLeft size={20}/></button>
          <button onClick={() => editor.chain().focus().setTextAlign("center").run()}><BiAlignMiddle size={20}/></button>
          <button onClick={() => editor.chain().focus().setTextAlign("right").run()}><BiAlignRight size={20}/></button>
          <button onClick={() => editor.chain().focus().undo().run()}><BiUndo size={20}/></button>
          <button onClick={() => editor.chain().focus().redo().run()}><BiRedo size={20}/></button>
          <button onClick={setLink}><BiLinkAlt size={20}/></button>
          <button onClick={() => setShowAiPanel(!showAiPanel)}><BsStars size={20}/></button>
          <select name="heading-size" onChange={headingChange} className={styles.toolbarOptions} defaultValue="">
            <option value="">Paragraph</option>
            <option value="1">largest</option>
            <option value="2">large</option>
            <option value="3">medium</option>
            <option value="4">small</option>
          </select>
        </div>

        <div className={styles.ToolBarRightBtns}>
          <button onClick={downloadPDF} disabled={downloading}>{ downloading ? "downloading.." : <BiDownload size={28}/>}</button>
        </div>

      </div>
      { showAiPanel && <AiPanel editor={editor} />}

      {editor && (
      <BubbleMenu 
      editor={editor}
      shouldShow={({editor}) => editor.isActive('link')}
      >
        <div className={styles.ToolBarBubbleMenu}>
          <button onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLink();
          }}>
            edit
          </button>
          <button onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            editor.commands.focus();
          }}>
            delete
          </button>
        </div>
      </BubbleMenu>)
      }
    </div>
  );
}

