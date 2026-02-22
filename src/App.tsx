import { Mark } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import './App.css';
import Popup from './Popup';

const InsertedText = Mark.create({
  name: 'insertedText',
  parseHTML() {
    return [{ tag: 'span.inserted-text' }];
  },
  renderHTML() {
    return ['span', { class: 'inserted-text' }, 0];
  },
});

const initial =
  "<p>Even when he was Odd Future's prime iconoclastic misfit, Tyler, the Creator always had a subtler, stranger side.</p><p>That finally came into full bloom on Flower Boy, one of the few hip-hop albums you could plausibly call gorgeous (which it is, frequently).</p><p>Tyler raps, of course, but he also sings, and slathers the songs with lush, jazzy production.</p><p>After using homophobic slurs as a crutch throughout his early career, the oblique revealing of same-sex desire on Flower Boy came as a refreshing surprise.</p>";

type PopupState = {
  visible: boolean;
  selectedText: string;
  position: { top: number; left: number };
  from: number;
  to: number;
};

function App() {
  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    selectedText: '',
    position: { top: 0, left: 0 },
    from: 0,
    to: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        linkOnPaste: false,
      }),
      InsertedText,
    ],
    content: initial,
    onUpdate() {
      setPopup((p) => (p.visible ? { ...p, visible: false } : p));
    },
  });

  const handlePaste = () => {
    setTimeout(() => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .selectAll()
        .setMeta('addToHistory', false)
        .unsetLink()
        .setTextSelection({ from, to })
        .run();
    }, 0);
  };

  const handleOpenPopup = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText.trim()) return;

    const domRange = window.getSelection()?.getRangeAt(0);
    if (!domRange) return;
    const rect = domRange.getBoundingClientRect();

    setPopup({
      visible: true,
      selectedText,
      position: { top: rect.bottom + 8, left: rect.left },
      from,
      to,
    });
  };

  const handleClose = () => {
    setPopup((p) => ({ ...p, visible: false }));
  };

  const handleLogText = () => {
    if (editor)
      console.log('Plain text:', editor.getText({ blockSeparator: '\n' }));
  };

  return (
    <div className='p-4 space-y-4'>
      <EditorContent
        editor={editor}
        className='bg-green-300 min-h-[200px] p-4 rounded [&_.ProseMirror]:outline-none'
        onPaste={handlePaste}
      />

      {editor && !popup.visible && (
        <BubbleMenu editor={editor}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenPopup}
            className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded shadow'
          >
            Rewrite with AI
          </button>
        </BubbleMenu>
      )}

      <Popup
        visible={popup.visible}
        selectedText={popup.selectedText}
        position={popup.position}
        from={popup.from}
        to={popup.to}
        editor={editor}
        onClose={handleClose}
      />

      <button
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        onClick={handleLogText}
      >
        Log Text Content
      </button>
    </div>
  );
}

export default App;
