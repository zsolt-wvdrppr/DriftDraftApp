"use client";
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $setSelection, $isRangeSelection } from 'lexical';

/**
 * useEditorChangeListener Hook:
 * - Prevents cursor jumping during text updates.
 * - Avoids infinite loops using strict state comparisons.
 * - Validates selection before restoring it to prevent Lexical errors.
 * 
 * @param {function} onChange - Callback fired when the editor state updates.
 */
export const useEditorChangeListener = (onChange) => {
    const [editor] = useLexicalComposerContext();
    const lastSelectionRef = useRef(null);

    useEffect(() => {
        if (!editor || typeof onChange !== 'function') return;

        const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
            let currentSelection = null;

            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    currentSelection = selection.clone();
                }
            });

            // Prevent redundant updates if the selection hasn't changed
            if (
                lastSelectionRef.current &&
                currentSelection &&
                currentSelection.anchor.key === lastSelectionRef.current.anchor.key &&
                currentSelection.anchor.offset === lastSelectionRef.current.anchor.offset &&
                currentSelection.focus.key === lastSelectionRef.current.focus.key &&
                currentSelection.focus.offset === lastSelectionRef.current.focus.offset
            ) {
                return; // Avoid unnecessary updates
            }

            lastSelectionRef.current = currentSelection;
            onChange(editorState);

            // Restore selection after update only if valid
            editor.update(() => {
                if (lastSelectionRef.current) {
                    const validAnchorNode = editor.getEditorState()._nodeMap.has(lastSelectionRef.current.anchor.key);
                    const validFocusNode = editor.getEditorState()._nodeMap.has(lastSelectionRef.current.focus.key);

                    if (validAnchorNode && validFocusNode) {
                        $setSelection(lastSelectionRef.current);
                    }
                }
            }, { discrete: true });
        });

        return () => unregisterListener();
    }, [editor, onChange]);

    return null; // No JSX rendering, just logic
};

export default useEditorChangeListener;
