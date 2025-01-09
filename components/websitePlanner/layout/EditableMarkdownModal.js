"use client";
import { useState, useRef, useEffect } from "react";
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { TextNode } from 'lexical';

import { marked } from "marked";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
} from "@nextui-org/react";
import logger from "@/lib/logger";

import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LoadContentPlugin from "@/lib/plugins/lexical/LoadContentPlugin";
import ToolbarPlugin from "@/lib/plugins/lexical/ToolbarPlugin";
import OnChangePlugin from "@/lib/plugins/lexical/OnChangePlugin";
import SaveButtonPlugin from "@/lib/plugins/lexical/SaveButtonPlugin";

import { toast } from "sonner";

import { useSessionContext } from "@/lib/SessionProvider";
import { useAuth } from "@/lib/AuthContext";

import { IconEye, IconEdit } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

const theme = {
    code: 'editor-code',
    heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
        h4: 'editor-heading-h4',
        h5: 'editor-heading-h5',
    },
    image: 'editor-image',
    link: 'editor-link',
    list: {
        listitem: 'editor-listitem',
        nested: {
            listitem: 'editor-nested-listitem',
        },
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
    },
    ltr: 'ltr',
    paragraph: 'editor-paragraph',
    placeholder: 'editor-placeholder',
    quote: 'editor-quote',
    rtl: 'rtl',
    text: {
        bold: 'editor-text-bold',
        code: 'editor-text-code',
        hashtag: 'editor-text-hashtag',
        italic: 'editor-text-italic',
        overflowed: 'editor-text-overflowed',
        strikethrough: 'editor-text-strikethrough',
        underline: 'editor-text-underline',
        underlineStrikethrough: 'editor-text-underlineStrikethrough',
    },
}

const onError = (error) => {
    try {
        if (error && error.message) {
            logger.error("Lexical error:", error.message);
        } else {
            logger.error("Unknown Lexical error occurred.", error);
        }
    } catch (err) {
        logger.error("Error in the Lexical error handler itself:", err);
    }
}

const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    // 👇 Register your extra node types here
    nodes: [
        ListNode,
        ListItemNode,
        HeadingNode,
        QuoteNode,
        CodeNode,
        LinkNode,
        TextNode,
        // Add any others you need
    ],
};

export const EditableMarkdownModal = ({
    item,
    isOpen,
    onOpenChange,
    markdownContent,
    setMarkdownContent,
    isLoading,
}) => {

    const { user } = useAuth();
    const { fetchAllSessionsFromDb, deleteSessionFromDb, initSessionFromDb, fetchAiGeneratedPlanFromDb, updateSessionTitleInDb, updateAiGeneratedPlanInDb } = useSessionContext();
    const [editor] = useLexicalComposerContext();

    const editorStateRef = useRef(null);

    const [previewMode, setPreviewMode] = useState(true);
    const [lastSavedContent, setLastSavedContent] = useState("");
    const [isSaved, setIsSaved] = useState(true);
    const [isSaveLoding, setIsSaveLoading] = useState(false);

    const handleSave = async () => {
        setIsSaveLoading(true);
        let md = "";
        editor.read(() => {
            md = $convertToMarkdownString(TRANSFORMERS);
            setMarkdownContent(md);
        });

        try {
            await updateAiGeneratedPlanInDb(user.id, item?.session_id, md);
            setLastSavedContent(md);
            toast.success("Content updated successfully!");
            setIsSaved(true);
            //onOpenChange(false);
        } catch (error) {
            toast.error("Failed to save content.");
            logger.error("Error saving markdown:", error);
        }

        setIsSaveLoading(false);
    };

    const [previousSessionId, setPreviousSessionId] = useState(null);

    useEffect(() => {

        editorStateRef.current = null;

        if (previousSessionId !== item?.session_id) {
            setPreviewMode(true);
            setPreviousSessionId(item?.session_id);
        }

    }), [item?.session_id];

    const handleEditorChange = async () => {

        let md = "";
        editor.read(() => {
            md = $convertToMarkdownString(TRANSFORMERS);
            setMarkdownContent(md);
        });

        editorStateRef.current = md;

        if (md === lastSavedContent) {
            setIsSaved(true);
        } else {
            setIsSaved(false);
        }

    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="absolute max-w-screen-2xl md:p-4 mx-auto top-0 m-1 mb-8 md:max-h-[90vh] relative"
            isDismissable={false}
        >
            <ModalContent className="flex flex-col h-[90vh] overflow-hidden">
    {(onClose) => (
        <div className="flex flex-col flex-1">
            {/* Header Section */}
            <div className="flex justify-around md:justify-start items-center">
                <ModalHeader className="w-full">
                    <p className="text-md md:text-xl py-3 px-4 text-center text-primary bg-slate-100 dark:bg-zinc-800 rounded-xl w-full">
                        {previewMode ? "Viewing Session" : "Editing Session"}
                    </p>
                </ModalHeader>
                <Button
                    color="secondary"
                    onPress={() => setPreviewMode((p) => !p)}
                    className="min-w-16 w-10 h-12 mr-10 md:mr-5"
                >
                    {previewMode ? <IconEdit /> : <IconEye />}
                </Button>
            </div>

            {/* Modal Body - Now Scrollable */}
            <ModalBody className="relative flex-1 pt-0 overflow-y-auto min-h-0 max-h-[calc(90vh-10rem)]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner color="primary" />
                    </div>
                ) : (
                    <div>
                        <LoadContentPlugin content={editorStateRef.current || markdownContent} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <AnimatePresence mode="wait">
                            {previewMode ? (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, x: 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="prose min-w-full md:p-8 mt-6 border rounded-md shadow-sm dark:text-white"
                                    dangerouslySetInnerHTML={{
                                        __html: marked(markdownContent || ""),
                                    }}
                                />
                            ) : (
                                <motion.div
                                    key="editor"
                                    initial={{ opacity: 0, x: 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="prose min-w-full"
                                >
                                    <div className="flex justify-end">
                                    <ToolbarPlugin
                                        onSave={handleSave}
                                        isSaved={isSaved}
                                        isSaveLoding={isSaveLoding}
                                        setPreviewMode={setPreviewMode}
                                        previewMode={previewMode}
                                    />
                                    </div>
                                    <RichTextPlugin
                                        contentEditable={
                                            <ContentEditable className="prose p-2 min-w-full mt-24 md:p-8 border focus-visible:outline-primary rounded-md shadow-sm dark:text-white" />
                                        }
                                        ErrorBoundary={LexicalErrorBoundary}
                                    />
                                    <OnChangePlugin onChange={handleEditorChange} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </ModalBody>

            {/* Footer Stays Fixed */}
            <ModalFooter className="flex-shrink-0 sticky -bottom-5 z-10 justify-between w-full max-w-screen-xl mt-2">
                <Button color="danger" onPress={onClose}>
                    <p className="font-semibold">Cancel</p>
                </Button>
                <Button
                    color="secondary"
                    onPress={() => setPreviewMode((p) => !p)}
                    className="w-40 flex justify-between items-center"
                >
                    {previewMode ? (
                        <>
                            <span className="font-semibold">Edit Mode</span>
                            <IconEye />
                        </>
                    ) : (
                        <>
                            <span className="font-semibold">Preview Mode</span>
                            <IconEdit />
                        </>
                    )}
                </Button>
                <SaveButtonPlugin onSave={handleSave} />
            </ModalFooter>
        </div>
    )}
</ModalContent>

        </Modal>
    );
}

export default EditableMarkdownModal;