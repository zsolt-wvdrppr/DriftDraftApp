import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useEffect, useState } from 'react';
import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ✅ Safely read the editor state using editorState.read()
  useEffect(() => {
    const updateToolbar = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
      });
    };

    // ✅ Listen for state changes using Lexical's built-in listeners
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(updateToolbar);
    });

    return () => {
      removeUpdateListener();
    };
  }, [editor]);

  return (
    <div className="flex space-x-2 bg-gray-100 p-2 rounded-md">
      <button
        className={`p-2 border ${isBold ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <IconBold />
      </button>
      <button
        className={`p-2 border ${isItalic ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <IconItalic />
      </button>
      <button
        className={`p-2 border ${isUnderline ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <IconUnderline  />
      </button>
      <button
        className="p-2 border"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        className="p-2 border"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
      >
        Redo
      </button>
    </div>
  );
}
