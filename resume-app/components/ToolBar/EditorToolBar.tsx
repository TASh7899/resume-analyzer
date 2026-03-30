/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor } from '@tiptap/react';
import type { ChangeEvent } from 'react';
// @ts-ignore
import styles from './EditorToolBar.module.css';
import api from "../../axiosConfig.ts";
import AiPanel from '../AiPanel/aiPanel.tsx';
import { useCallback, useState, useRef } from "react";

import { BiAlignMiddle, BiAlignLeft, BiAlignRight, BiBold, BiItalic, 
BiUnderline, BiListUl, BiListOl, BiMoveHorizontal, BiUndo, BiRedo, BiLinkAlt, BiDownload, BiKey, BiCheckCircle, BiUpload, BiInfoCircle } from "react-icons/bi";
import { BsStars } from "react-icons/bs";

import { BubbleMenu } from "@tiptap/react/menus";

type Props = {
  editor: Editor | null;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export default function ToolBar({ editor }: Props) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);

  const [showAiPanel, setShowAiPanel] = useState(false);
  const [downloading, setdownloading] = useState(false);

  const [keyIsActive, setKeyIsActive] = useState(() => {
    return localStorage.getItem("gemini_key_active") === "true";
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [tempKey, setTempKey] = useState("");
  
  const [keyMessage, setKeyMessage] = useState({ text: "", isError: false });

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [tempLinkUrl, setTempLinkUrl] = useState("");

  const handleSaveKey = async () => {
    if (!tempKey.trim()) return;
    
    try {
      setKeyMessage({ text: "Saving...", isError: false });
      
      const res = await api.post("/pdf/set-key", { apiKey: tempKey.trim() });
      
      setKeyMessage({ text: res.data.message || "Key secured for session", isError: false });
      setKeyIsActive(true);
      localStorage.setItem("gemini_key_active", "true");
      setTempKey(""); 
      
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyMessage({ text: "", isError: false });
      }, 1500);
      
    } catch (error: any) {
      console.error("Failed to save API key securely", error);
      const errorMsg = error.response?.data?.error || "Failed to save key";
      setKeyMessage({ text: errorMsg, isError: true });
    }
  };

  const handleClearKey = async () => {
    try {
      setKeyMessage({ text: "Clearing...", isError: false });
      
      const res = await api.post("/pdf/set-key", { apiKey: "" });
      
      setKeyMessage({ text: res.data.message || "Key cleared successfully", isError: false });
      setKeyIsActive(false);
      setTempKey("");
      localStorage.removeItem("gemini_key_active");
      
      setTimeout(() => {
        setShowKeyModal(false);
        setKeyMessage({ text: "", isError: false });
      }, 1500);
      
    } catch (error: any) {
      console.error("Failed to clear API key", error);
      const errorMsg = error.response?.data?.error || "Failed to clear key";
      setKeyMessage({ text: errorMsg, isError: true });
    }
  };


  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    try {
      setIsParsing(true);

      const formData = new FormData();
      formData.append("resumePdf", file);

      const res = await api.post("/pdf/parse", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.markdown && editor) {
        if (editor.storage.markdown) {
          // @ts-expect-error - TS definitions for TipTap markdown are often missing this property
          editor.commands.setContent(res.data.markdown, { contentType: 'markdown' });
        } else {
          editor.commands.setContent(res.data.markdown);
        }
      }

    } catch (error) {
      console.error("Failed to parse PDF", error);
      alert("Failed to parse the PDF. Please try again.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openKeyModal = () => {
    setKeyMessage({ text: "", isError: false });
    setShowKeyModal(true);
  };

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
    const chain = editor.chain().focus() as any;

    if (level == "") {
      chain.setParagraph().run();
    } else {
      chain.toggleHeading({ level: Number(level) }).run();
    };
  }, [editor]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousURL = editor.getAttributes('link')?.href ?? "";
    setTempLinkUrl(previousURL);
    setShowLinkModal(true);
  }, [editor]);

  const handleSaveLink = useCallback(() => {
    if (!editor) return;

    let url = tempLinkUrl.trim();

    if (url === "") {
      (editor.chain().focus().extendMarkRange('link') as any).unsetLink().run();
      editor.commands.focus();
      setShowLinkModal(false);
      return;
    }

    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
      url = "https://" + url;
    }

      (editor.chain().focus().extendMarkRange('link') as any).setLink({ href: url }).run();
      editor.commands.focus();
      setShowLinkModal(false);
  }, [editor, tempLinkUrl]);


  if (!editor) {
    return <div className={styles.ToolBarIsDisabled}>Loading editor…</div>;
  }

  return (
    <div>
    <div className={styles.toolbar}>

    <div className={styles.ToolBarLeftBtns}>
    {/* ADDED type="button" TO EVERY SINGLE BUTTON TO PREVENT PAGE REFRESH/FORM SUBMISSION */}
    <button type="button" onClick={() => (editor.chain().focus() as any).toggleBold().run()}><BiBold size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).toggleItalic().run()}><BiItalic size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}><BiUnderline size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).toggleBulletList().run()}><BiListUl size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()}><BiListOl size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).setHorizontalRule().run()}><BiMoveHorizontal size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).setTextAlign("left").run()}><BiAlignLeft size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).setTextAlign("center").run()}><BiAlignMiddle size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).setTextAlign("right").run()}><BiAlignRight size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).undo().run()}><BiUndo size={20}/></button>
    <button type="button" onClick={() => (editor.chain().focus() as any).redo().run()}><BiRedo size={20}/></button>
    <button type="button" onClick={openLinkModal}><BiLinkAlt size={20}/></button>
    <button type="button" onClick={() => setShowAiPanel(!showAiPanel)} title="Toggle AI Panel"><BsStars size={20}/></button>

    <button type="button" onClick={() => setShowInfoModal(true)} title="How to use">
      <BiInfoCircle size={20} />
    </button>

    <button type="button" onClick={openKeyModal} title="Set Custom Gemini API Key">
    {keyIsActive ? <BiCheckCircle size={20} style={{ fill: "green" }} /> : <BiKey size={20} />}
    </button>

    <select name="heading-size" onChange={headingChange} className={styles.toolbarOptions} defaultValue="">
    <option value="">Paragraph</option>
    <option value="1">largest</option>
    <option value="2">large</option>
    <option value="3">medium</option>
    <option value="4">small</option>
    </select>
    </div>

    <div className={styles.ToolBarRightBtns}>
    <input 
    type="file" 
    accept="application/pdf" 
    ref={fileInputRef} 
    onChange={handleFileUpload} 
    style={{ display: "none" }} 
    />

    <button type="button" 
    onClick={() => fileInputRef.current?.click()} 
    disabled={isParsing || downloading}
    title="Import from PDF"
    >
    {isParsing ? "parsing..." : <BiUpload size={28}/>}
    </button>

    <button type="button" onClick={downloadPDF} disabled={downloading || isParsing}>
    { downloading ? "downloading.." : <BiDownload size={28}/>}
    </button>
    </div>

    </div>

    { showAiPanel && <AiPanel editor={editor} />}

    {showKeyModal && (
      <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
      <h3 style={{marginTop: 0, marginBottom: "5px"}}>Set API Key</h3>
      <p style={{fontSize: "14px", marginTop: 0}}>Provide your own Gemini API key for this session.</p>

        <input 
        type="password" 
        value={tempKey} 
        onChange={(e) => setTempKey(e.target.value)} 
        placeholder="AIzaSy..." 
        className={styles.modalInput}
        style={{ marginBottom: keyMessage.text ? "10px" : "20px" }}
        />

        {keyMessage.text && (
          <div style={{
            fontSize: "13px", 
            color: keyMessage.isError ? "var(--error, #e74c3c)" : "var(--success, #2ecc71)",
            marginBottom: "15px",
            fontWeight: "bold"
          }}>
          {keyMessage.text}
          </div>
        )}

        <div className={styles.modalActions}>
        <button type="button" onClick={() => setShowKeyModal(false)}>Cancel</button>
        <button type="button" onClick={handleClearKey}>Clear</button>
        <button type="button" onClick={handleSaveKey} className={styles.saveBtn}>Save</button>
        </div>
        </div>
        </div>
    )}

    {showLinkModal && (
      <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
      <h3 style={{marginTop: 0}}>Set Link</h3>
      <p style={{fontSize: "14px"}}>Enter the URL for this text.</p>
        <input 
      type="text" 
      value={tempLinkUrl} 
      onChange={(e) => setTempLinkUrl(e.target.value)} 
      placeholder="https://..." 
        className={styles.modalInput}
      autoFocus
      />
      <div className={styles.modalActions}>
      <button type="button" onClick={() => setShowLinkModal(false)}>Cancel</button>
      <button type="button" onClick={() => setTempLinkUrl("")}>Clear</button>
      <button type="button" onClick={handleSaveLink} className={styles.saveBtn}>Save</button>
      </div>
      </div>
      </div>
    )}

    {showInfoModal && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent} style={{ width: "350px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "10px" }}>How to use this app</h3>

          <ul style={{ fontSize: "14px", paddingLeft: "20px", margin: "0 0 15px 0", lineHeight: "1.5" }}>
            <li>Write or paste your resume content in the editor.</li>
            <li>Use the <strong>PDF Import</strong> button to parse an existing resume.</li>
            <li>Click the <strong>AI Sparkles</strong> icon to open the AI Panel and generate suggestions or improvements.</li>
            <li>Use the <strong>Download</strong> button to export your final resume as a PDF.</li>
          </ul>

          <div style={{ backgroundColor: "rgba(231, 76, 60, 0.1)", borderLeft: "4px solid #e74c3c", padding: "10px", borderRadius: "4px", fontSize: "13px", marginBottom: "20px" }}>
            <strong>Note:</strong> If AI Generation or PDF Parsing is failing, the default server API key may have expired. Click the <strong>Key icon</strong> in the toolbar to temporarily use your own Gemini API Key.
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={() => setShowInfoModal(false)} className={styles.saveBtn}>Got it</button>
          </div>
          </div>
      </div>
    )}



    {editor && (
      <BubbleMenu 
      editor={editor}
      shouldShow={({editor}) => editor.isActive('link')}
      >
      <div className={styles.ToolBarBubbleMenu}>
      <button type="button" onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openLinkModal();
      }}>
      edit
      </button>
      <button type="button" onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        (editor.chain().focus().extendMarkRange("link") as any).unsetLink().run();
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
