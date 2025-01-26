"use client";
import { useState, useEffect } from "react";
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { marked } from "marked";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
} from "@heroui/react";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { toast } from "sonner";
import { IconEye, IconEdit } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

import logger from "@/lib/logger";
import ToolbarPlugin from "@/lib/plugins/lexical/ToolbarPlugin";
import SaveButtonPlugin from "@/lib/plugins/lexical/SaveButtonPlugin";
import useLoadContent from "@/lib/plugins/lexical/useLoadContent";
import useEditorChangeListener from "@/lib/plugins/lexical/useEditorChangeListener";
import { useSessionContext } from "@/lib/SessionProvider";
import { useAuth } from "@/lib/AuthContext";


export const EditableMarkdownModal = ({
    item,
    isOpen,
    onOpenChange,
    markdownContent,
    setMarkdownContent,
    isLoading,
}) => {

    const { user } = useAuth();
    const { updateAiGeneratedPlanInDb } = useSessionContext();
    const [editor] = useLexicalComposerContext();

    const [previewMode, setPreviewMode] = useState(true);
    const [lastSavedContent, setLastSavedContent] = useState("");
    const [isSaved, setIsSaved] = useState(true);
    const [isSaveLoding, setIsSaveLoading] = useState(false);

    //const markdownRef = useRef(null);

    

    useLoadContent(editor, markdownContent, item?.session_id);

    useEditorChangeListener(() => {        
        if (editor) {
            editor.read(() => {
                const newMarkdown = $convertToMarkdownString(TRANSFORMERS);

                if (newMarkdown !== lastSavedContent) {
                    setMarkdownContent(newMarkdown);
                    logger.debug("Markdown content updated:", newMarkdown);
                }
                logger.debug("Markdown content NOT updated:", newMarkdown);
                setIsSaved(newMarkdown === lastSavedContent);
    
            });
        } else {
            logger.error("Editor not found.");
        }
    });


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
            toast.success("Content updated successfully!", { classNames: { toast: 'text-green-600' } });
            setIsSaved(true);
 
        } catch (error) {
            toast.error("Failed to save content.");
            logger.error("Error saving markdown:", error);
        }

        setIsSaveLoading(false);
    };

    const [previousSessionId, setPreviousSessionId] = useState(null);

    useEffect(() => {

        if (previousSessionId !== item?.session_id) {
            setPreviewMode(true);
            setPreviousSessionId(item?.session_id);
        }

    }), [item?.session_id];

    return (
        <Modal
            className="absolute max-w-screen-2xl md:p-4 mx-auto top-0 m-1 mb-8 md:max-h-[90vh]"
            isDismissable={false}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent className="flex flex-col h-[90vh] overflow-hidden">
                {(onClose) => (
                    <div className="flex flex-col flex-1">
                        {/* Header Section */}
                        <div className="flex justify-around md:justify-start items-center">
                            <ModalHeader className="w-full">
                                <p className="text-md md:text-xl py-3 px-4 text-center text-primary bg-slate-100 dark:bg-zinc-800 rounded-xl w-full">
                                    {previewMode ? "Viewing Your Plan" : "Editing Your Plan"}
                                </p>
                            </ModalHeader>
                            <Button
                                className="min-w-16 w-10 h-12 mr-10 md:mr-5"
                                color="secondary"
                                isDisabled={markdownContent === "No content available."}
                                onPress={() => setPreviewMode((p) => !p)}
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
                                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                                    <HistoryPlugin />
                              
                                    <AnimatePresence mode="wait">
                                        {previewMode ? (
                                            <motion.div
                                                dangerouslySetInnerHTML={{
                                                    __html: marked(markdownContent),
                                                }}
                                                key="preview"
                                                animate={{ opacity: 1, x: 0 }}
                                                className="prose min-w-full md:p-8 mt-6 border rounded-md shadow-sm dark:text-white"
                                                exit={{ opacity: 0, x: -20 }}
                                                initial={{ opacity: 0, x: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            />
                                        ) : (
                                            <motion.div
                                                key="editor"
                                                animate={{ opacity: 1, x: 0 }}
                                                className="prose min-w-full"
                                                exit={{ opacity: 0, x: 20 }}
                                                initial={{ opacity: 0, x: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="flex justify-end">
                                                    <ToolbarPlugin
                                                        isSaveLoding={isSaveLoding}
                                                        isSaved={isSaved}
                                                        previewMode={previewMode}
                                                        setPreviewMode={setPreviewMode}
                                                        onSave={handleSave}
                                                    />
                                                </div>
                                                <AutoFocusPlugin />
                                                <RichTextPlugin
                                                    ErrorBoundary={LexicalErrorBoundary}
                                                    contentEditable={
                                                        <ContentEditable className="prose p-2 min-w-full mt-24 md:p-8 border focus-visible:outline-primary rounded-md shadow-sm dark:text-white" />
                                                    }
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </ModalBody>

                        {/* Footer Stays Fixed */}
                        <ModalFooter className="flex-shrink-0 sticky -bottom-5 z-10 mx-auto justify-between w-full max-w-screen-xl mt-2">
                            <Button color="danger" onPress={onClose}>
                                <p className="font-semibold">Cancel</p>
                            </Button>
                            <Button
                                className="w-40 flex justify-between items-center"
                                color="secondary"
                                isDisabled={markdownContent === "No content available."}
                                onPress={() => setPreviewMode((p) => !p)}
                            >
                                {previewMode ? (
                                    <>
                                        <span className="font-semibold">Edit Mode</span>
                                        <IconEdit />
                                    </>
                                ) : (
                                    <>
                                        <span className="font-semibold">Preview Mode</span>
                                        <IconEye />
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