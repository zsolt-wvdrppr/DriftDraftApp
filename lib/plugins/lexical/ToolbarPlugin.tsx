/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconArrowBackUp, IconArrowForwardUp, IconBold, IconItalic, IconAlignLeft2, IconAlignRight2, IconAlignCenter, IconAlignJustified, IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from '@heroui/react';

const LowPriority = 1;

function Divider() {
    return <div className="divider" />;
}

interface ToolbarPluginProps {
    onSave: () => void;
    isSaved: boolean;
    isSaveLoading: boolean;
    setPreviewMode: (value: boolean | ((prevValue: boolean) => boolean)) => void;
    className?: string;
}

export default function ToolbarPlugin({ onSave, isSaved, isSaveLoading }: ToolbarPluginProps) {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
        }
    }, []);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    $updateToolbar();

                    return false;
                },
                LowPriority,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);

                    return false;
                },
                LowPriority,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);

                    return false;
                },
                LowPriority,
            ),
        );
    }, [editor, $updateToolbar]);

    return (
        <div ref={toolbarRef} className="toolbar w-full fixed left-0 top-10 flex">
            <div className='flex justify-around w-full px-12 flex-wrap md:flex-row gap-3 max-w-2xl mx-auto'>
                <div className='flex gap-2'>
                    <Button
                        aria-label="Undo"
                        className="toolbar-item min-w-10 w-10 h-10 px-0 bg-white dark:bg-content1"
                        disabled={!canUndo}
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(UNDO_COMMAND, undefined);
                        }}>
                        <IconArrowBackUp />
                    </Button>
                    <Button
                        aria-label="Redo"
                        className="toolbar-item min-w-10 w-10 h-10 px-0 bg-white dark:bg-content1"
                        disabled={!canRedo}
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(REDO_COMMAND, undefined);
                        }}>
                        <IconArrowForwardUp />
                    </Button>
                </div>
                <div className='flex gap-2'>
                    <Button
                        aria-label="Format Bold"
                        className={'toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 bg-white dark:bg-content1' + (isBold ? 'active px-0 text-success' : '')}
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                        }}>
                        <IconBold />
                    </Button>
                    <Button
                        aria-label="Format Italics"
                        className={'toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 bg-white dark:bg-content1' + (isItalic ? 'active px-0 text-success' : '')}
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                        }}>
                        <IconItalic />
                    </Button>
                    {/*<Button
                        variant='ghost'
                        onPress={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                        }}
                        className={'toolbar-item toolbar-item min-w-10 w-10 h-10 px-0' + (isUnderline ? 'active' : '')}
                        aria-label="Format Underline">
                        <IconUnderline />
                    </Button>
                    <Button
                        variant='ghost'
                        onPress={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                        }}
                        className={'toolbar-item toolbar-item min-w-10 w-10 h-10 px-0' + (isStrikethrough ? 'active' : '')}
                        aria-label="Format Strikethrough">
                        <IconStrikethrough />
                    </Button>*/}
                </div>
                <div className='flex gap-2'>
                    <Button
                        aria-label="Left Align"
                        className='toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 p-0 bg-white dark:bg-content1'
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                        }}>
                        <IconAlignLeft2 />
                    </Button>
                    <Button
                        aria-label="Center Align"
                        className='toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 p-0 bg-white dark:bg-content1'
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                        }}>
                        <IconAlignCenter />
                    </Button>
                    <Button
                        aria-label="Right Align"
                        className='toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 p-0 bg-white dark:bg-content1'
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                        }}>
                        <IconAlignRight2 />
                    </Button>
                    <Button
                        aria-label="Justify Align"
                        className='toolbar-item toolbar-item min-w-10 w-10 h-10 px-0 p-0 bg-white dark:bg-content1'
                        variant='ghost'
                        onPress={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                        }}>
                        <IconAlignJustified />
                    </Button>{' '}
                </div>
                <div>
                    <Button
                        aria-label="Save"
                        className={`toolbar-item min-w-10 w-10 h-10 px-0 text-white ${isSaved ? 'bg-success' : 'bg-danger'}`}
                        isDisabled={isSaveLoading}
                        isLoading={isSaveLoading}
                        variant='ghost'
                        onPress={onSave}
                    >
                        {!isSaveLoading && <IconDeviceFloppy />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
