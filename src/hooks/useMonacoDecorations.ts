
import { useRef, useCallback } from 'react';

export interface CodeRange {
  startLine: number;
  endLine: number;
}

export interface ExplanationWithRange {
  explanation: string;
  range: CodeRange;
  id: string;
}

// Define the Monaco Editor interface we need
interface MonacoEditor {
  deltaDecorations: (oldDecorations: string[], newDecorations: any[]) => string[];
  revealLineInCenter: (lineNumber: number) => void;
}

export const useMonacoDecorations = () => {
  const decorationIdsRef = useRef<string[]>([]);
  const editorRef = useRef<MonacoEditor | null>(null);

  const setEditor = useCallback((editorInstance: MonacoEditor) => {
    editorRef.current = editorInstance;
  }, []);

  const highlightLines = useCallback((range: CodeRange, isActive = false) => {
    if (!editorRef.current) return;

    // Clear existing decorations
    clearHighlights();

    const className = isActive 
      ? 'monaco-highlight-active' 
      : 'monaco-highlight-default';

    const newDecorations = editorRef.current.deltaDecorations([], [
      {
        range: {
          startLineNumber: range.startLine,
          startColumn: 1,
          endLineNumber: range.endLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className,
          linesDecorationsClassName: 'monaco-highlight-gutter',
        },
      },
    ]);

    decorationIdsRef.current = newDecorations;
  }, []);

  const scrollToLines = useCallback((range: CodeRange) => {
    if (!editorRef.current) return;

    const middleLine = Math.floor((range.startLine + range.endLine) / 2);
    editorRef.current.revealLineInCenter(middleLine);
  }, []);

  const clearHighlights = useCallback(() => {
    if (!editorRef.current || decorationIdsRef.current.length === 0) return;

    editorRef.current.deltaDecorations(decorationIdsRef.current, []);
    decorationIdsRef.current = [];
  }, []);

  const highlightAndScroll = useCallback((range: CodeRange, isActive = false) => {
    highlightLines(range, isActive);
    scrollToLines(range);
  }, [highlightLines, scrollToLines]);

  return {
    setEditor,
    highlightLines,
    scrollToLines,
    clearHighlights,
    highlightAndScroll,
  };
};
