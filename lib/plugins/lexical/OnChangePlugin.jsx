import { useEffect } from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const OnChangePlugin = ({ onChange }) => {
    // Access the editor through the LexicalComposerContext
    const [editor] = useLexicalComposerContext();
    // Wrap our listener in useEffect to handle the teardown and avoid stale references.
    useEffect(() => {
      // most listeners return a teardown function that can be called to clean them up.
      return editor.registerUpdateListener(({editorState}) => {
        // call onChange here to pass the latest state up to the parent.
        onChange(editorState);
      });
    }, [editor, onChange]);
    return null;
  }

export default OnChangePlugin;