import { useState, useEffect } from "react";
import { Editor } from '@tiptap/react';
import api from "../axiosConfig.ts";
import styles from './aiPanel.module.css';
import PopUp from "../components/popup/PopUp.jsx";

type Props = {
  editor: Editor | null;
};

export default function Aipanel({ editor }: Props) {

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


  const cleanHtmlString = (html: string) => {
    return html
      .replace(/\r/g, "")
      .replace(/\n\s*/g, "")
      .replace(/<p><\/p>/g, "")
      .replace(/<\/?(html|body)>/g, "")
      .replace(/(<br\s*\/?>\s*){2,}/g, "<br>")
      .trim();
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
      setShowPop(true);
      const cleaned = cleanHtmlString(suggestions || "");
      if (cleaned.length > 0) {
        editor.chain().focus().setContent(cleaned).run();
        setShowSuggestion(true);
      }
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

  const textArea = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <>
    {showPop && <PopUp message={aiResponse} onClose={() => setShowPop(false)} />}

    <div className={styles.aiPanel}>
      <textarea
      value={prompt}
      onChange={textArea}
      placeholder="type here"
      rows={1}
      className={styles.aiPanelTextArea}
        />

      <div>
      <button onClick={() => AI()} disabled={isEvaluating}>
      {isEvaluating ? "loading..." : "Generate"}
      </button>
      {aiResponse && <button onClick={() => setShowPop(!showPop)}>message</button>}
      </div>

      {pendingChanges && (
        <div className={styles.suggestionActions}>
        <button onClick={toggleSuggestion}>
        {showSuggestion ? "Show Original" : "Show Suggestion"}
        </button>
        <button onClick={applySuggestion}>Apply</button>
        <button onClick={discardSuggestion}>Discard</button>
        </div>
      )}
    </div>
    </>

  )
}
