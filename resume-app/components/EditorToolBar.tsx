import { Editor } from '@tiptap/react';
import styles from './EditorToolBar.module.css';
import api from "../axiosConfig.ts";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useState, useEffect } from "react";
import AiPanel from './aiPanel.tsx';



type Props = {
  editor: Editor | null;
};

export default function ToolBar({ editor }: Props) {
  const [prompt, setPrompt] = useState("");

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [suggestionsHTML, setSuggestionsHTML] = useState("");
  const [pendingChanges, setPendingChanges] = useState(false);

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [oldContent, setOldContent] = useState("");

  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isEvaluating);
    }
  }, [editor, isEvaluating]);

  if (!editor) return null;

  const cleanHtmlString = (html: string) => {
    return html
      .replace(/\r/g, "")
      .replace(/\n\s*/g, "")
      .replace(/<p><\/p>/g, "")
      .replace(/<\/?(html|body)>/g, "")
      .replace(/(<br\s*\/?>\s*){2,}/g, "<br>")
      .trim();
  };

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

  const AI = async () => {
    if (!editor || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const html = editor.getHTML();
      const mainPrompt = html + prompt
      const res = await api.post("/pdf/AI", { prompt: mainPrompt });

      const response = res.data.response;
      const suggestions = res.data.output;

      setAiResponse(response || "");
      setSuggestionsHTML(suggestions || "");
      setPendingChanges(Boolean(suggestions));
      setOldContent(editor.getHTML())

      const cleaned = cleanHtmlString(suggestions || "");
      if (cleaned.length > 0) {
        editor.chain().focus().setContent(cleaned).run();
        setShowSuggestion(true);
      }
      setShowPop(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleSuggestion = () => {
    if (!editor || !pendingChanges) return;

    if (!showSuggestion) {
      if (!oldContent) {
        setOldContent(editor.getHTML());
      }

      const cleaned = cleanHtmlString(suggestionsHTML || "");
      if (cleaned.length === 0) return;

      editor.chain().focus().setContent(cleaned).run();
      setShowSuggestion(true);
    } else {
      // restore original
      editor.chain().focus().setContent(oldContent || "").run();
      setShowSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (!editor || !pendingChanges) return;

    if (!showSuggestion) {
      const cleaned = cleanHtmlString(suggestionsHTML || "");
      if (cleaned.length === 0) return;
      if (!oldContent) {
        setOldContent(editor.getHTML());
      }
      editor.chain().focus().setContent(cleaned).run();
    }

    setPendingChanges(false);
    setShowSuggestion(false);
    setOldContent("");
    setSuggestionsHTML("");
    setAiResponse("");
  };

  const discardSuggestion = () => {
    if (!editor) return;

    if (oldContent) {
      editor.chain().focus().setContent(oldContent).run();
    }

    // Clear suggestion state
    setPendingChanges(false);
    setShowSuggestion(false);
    setOldContent("");
    setSuggestionsHTML("");
    setAiResponse("");
  };

   const headingChange = (event) => {
    const level = event.target.value;

    if (level == "") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: Number(level)}).run();
    };
  }

  return (
    <div className={styles.toolbar}>

    <div>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
      <select name="heading-size" onChange={headingChange} class={styles.toolbarOptions} defaultValue="">
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

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt (for generate)"
          />

          <button onClick={() => AI()} disabled={isEvaluating}>
            {isEvaluating ? "loading..." : "AI"}
          </button>

          {pendingChanges && (
            <div className={styles.suggestionActions}>
              <button onClick={toggleSuggestion}>
                {showSuggestion ? "Show Original" : "Show Suggestion"}
              </button>
              <button onClick={applySuggestion}>Apply</button>
              <button onClick={discardSuggestion}>Discard</button>
            </div>
          )}

          {aiResponse && (
            <Popup open={showPop} onClose={() => setShowPop(false)} position={"down right"} trigger={<button>message</button>} closeOnDocumentClick>
              <div style={{ maxWidth: 360, padding: 12 }}>{aiResponse}</div>
            </Popup>
          )}

      <button onClick={downloadPDF}>Download</button>
      </div>
    </div>
  );
}

