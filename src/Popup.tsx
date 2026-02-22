import { useEffect } from 'react';
import type { Editor } from '@tiptap/core';

type PopupProps = {
  visible: boolean;
  selectedText: string;
  position: { top: number; left: number };
  from: number;
  to: number;
  editor: Editor | null;
  onClose: () => void;
};

export default function Popup({
  visible,
  selectedText,
  position,
  from,
  to,
  editor,
  onClose,
}: PopupProps) {
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const applyText = (text: string) => {
    if (!editor) return;
    const $from = editor.state.doc.resolve(from);
    const inheritedMarks = $from
      .marks()
      .filter((m) => m.type.name !== 'insertedText')
      .map((m) => ({ type: m.type.name, attrs: m.attrs }));
    editor
      .chain()
      .focus()
      .setTextSelection({ from, to })
      .deleteSelection()
      .insertContent({
        type: 'text',
        marks: [...inheritedMarks, { type: 'insertedText' }],
        text,
      })
      .run();
    onClose();
  };

  const handleCapitalize = () => applyText(selectedText.toUpperCase());

  const handleRandomize = () => {
    const randomized = Array.from(selectedText, (ch) =>
      ch === ' ' ? ' ' : Math.random() < 0.5 ? '0' : '1'
    ).join('');
    applyText(randomized);
  };

  const handleReverse = () => applyText([...selectedText].reverse().join(''));

  if (!visible) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black/30 z-10' onClick={onClose} />
      <div
        className='fixed bg-white border rounded shadow p-3 z-20 space-y-2'
        style={{ top: position.top, left: position.left }}
      >
        <div className='text-sm text-gray-700 max-w-xs truncate'>
          &quot;{selectedText}&quot;
        </div>
        <div className='flex gap-2'>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCapitalize}
            className='px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm'
          >
            Capitalize
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRandomize}
            className='px-3 py-1 rounded bg-purple-500 hover:bg-purple-600 text-white text-sm'
          >
            Randomize
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleReverse}
            className='px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm'
          >
            Reverse
          </button>
        </div>
      </div>
    </>
  );
}
