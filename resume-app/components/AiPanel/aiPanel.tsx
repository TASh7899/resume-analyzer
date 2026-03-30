import { useState, useEffect, useRef } from "react";
import { Editor } from '@tiptap/react';
import api from "../../axiosConfig.ts";
import styles from './aiPanel.module.css';
import PopUp from "../popup/PopUp.jsx";

type Props = {
  editor: Editor | null;
  apiKey?: string; 
};

export default function Aipanel({ editor, apiKey }: Props) {

  const [prompt, setPrompt] = useState("");

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [suggestionsMarkdown, setSuggestionsMarkdown] = useState("");
  const [pendingChanges, setPendingChanges] = useState(false);

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [oldContent, setOldContent] = useState("");

  const [showPop, setShowPop] = useState(false);
  const isProgrammaticUpdate = useRef(false);

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isEvaluating);
    }
  }, [editor, isEvaluating]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (pendingChanges && !isProgrammaticUpdate.current) {
        setPendingChanges(false);
        setShowSuggestion(false);
        setOldContent("");
        setSuggestionsMarkdown("");
        setAiResponse("Changes auto-applied based on your edits.");
        setShowPop(true);
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, pendingChanges]);

  const safeSetEditorContent = (content: string) => {
    if (!editor) return;
    isProgrammaticUpdate.current = true;
    
    if ((editor.storage as any).markdown) {
      // @ts-expect-error - TS definitions for TipTap markdown are missing this property
      editor.commands.setContent(content, { contentType: 'markdown' }); 
    } else {
      editor.commands.setContent(content); 
    }
    
    isProgrammaticUpdate.current = false;
  };

  const AI = async () => {
    if (!editor || isEvaluating) return;
    
    setIsEvaluating(true);
    try {
      setIsError(false);
      let currentContent = "";
      if ((editor.storage as any).markdown) {
        currentContent = (editor.storage as any).markdown.getMarkdown();
      } else {
        currentContent = editor.getHTML();
        console.warn("Markdown extension not found. Falling back to HTML.");
      }
      
      const mainPrompt = `Current Document:\n${currentContent}\n\nUser Request:\n${prompt}`;
      
      const res = await api.post("/pdf/AI", { 
        prompt: mainPrompt,
        apiKey: apiKey 
      });

      const responseMessage = res.data.response || "Content successfully evaluated.";
      const suggestions = res.data.output || "";

      setAiResponse(responseMessage);
      setSuggestionsMarkdown(suggestions);
      setPendingChanges(Boolean(suggestions));
      setOldContent(currentContent); 
      setShowPop(true);
      
      if (suggestions.trim().length > 0) {
        safeSetEditorContent(suggestions); 
        setShowSuggestion(true);
      }
    } catch (err: any) {
      console.error(err);
      setIsError(true)
      let errorMessage = err.response?.data?.error || "An error occurred during AI generation.";
      if (err.response?.status == 401 || err.response?.status === 403) {
        errorMessage = "API Key expired or invalid. Please update your key in the toolbar.";
      }
      setAiResponse(errorMessage);
      setShowPop(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleSuggestion = () => {
    if (!editor || !pendingChanges) return;

    if (!showSuggestion) {
      if (suggestionsMarkdown.trim().length === 0) return;
      safeSetEditorContent(suggestionsMarkdown);
      setShowSuggestion(true);
    } else {
      safeSetEditorContent(oldContent);
      setShowSuggestion(false);
    }
  };

  const applySuggestion = () => {
    if (!editor || !pendingChanges) return;

    if (!showSuggestion && suggestionsMarkdown.trim().length > 0) {
      safeSetEditorContent(suggestionsMarkdown);
    }

    setPendingChanges(false);
    setShowSuggestion(false);
    setOldContent("");
    setSuggestionsMarkdown("");
    setAiResponse("Suggestion applied.");
    setShowPop(true);
  };

  const discardSuggestion = () => {
    if (!editor) return;

    if (oldContent) {
      safeSetEditorContent(oldContent);
    }

    setPendingChanges(false);
    setShowSuggestion(false);
    setOldContent("");
    setSuggestionsMarkdown("");
  };

  const textArea = (e : React.ChangeEvent<HTMLTextAreaElement>) : void => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <>
    {showPop && <PopUp message={aiResponse} onClose={() => setShowPop(false)} isError={isError} />}

    <div className={styles.aiPanel}>
      <textarea
        value={prompt}
        onChange={textArea}
        placeholder="type here"
        rows={1}
        className={styles.aiPanelTextArea}
      />

      <div className={styles.AiPanelGenBtn}>
        <button type="button" onClick={AI} disabled={isEvaluating}>
          {isEvaluating ? "loading..." : "Generate"}
        </button>
        {aiResponse && <button type="button" onClick={() => setShowPop(!showPop)}>message</button>}
      </div>

      {pendingChanges && (
        <div className={styles.suggestionActions}>
          <span style={{ fontSize: "12px", alignSelf: "center", marginRight: "10px", color: showSuggestion ? "green" : "orange", fontWeight: "bold" }}>
            {showSuggestion ? "Previewing AI Changes" : "Viewing Original"}
          </span>
          <button type="button" onClick={toggleSuggestion}>
            {showSuggestion ? "Show Original" : "Show Suggestion"}
          </button>
          
          <button type="button" onClick={applySuggestion}>Apply</button>
          <button type="button" onClick={discardSuggestion}>Discard</button>
        </div>
      )}
    </div>
    </>
  )
}
