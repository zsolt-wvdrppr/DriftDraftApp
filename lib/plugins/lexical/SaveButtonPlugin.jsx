import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from "@nextui-org/react";

const SaveButtonPlugin = ({ onSave }) => {
  const [editor] = useLexicalComposerContext();

  const handleSave = () => {
    editor.update(() => {
      // Get the current editor state and pass it to onSave directly
      const editorState = editor.getEditorState();
      onSave(editorState);
    });
  };

  return (
    <Button
      color="primary"
      onClick={handleSave}
      className=""
    >
      <p className='font-semibold'>Save</p>
    </Button>
  );
};

export default SaveButtonPlugin;

