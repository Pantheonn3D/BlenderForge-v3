// src/features/articleCreator/components/TextBlockEditor.jsx

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
// If your TextBlockEditor will handle images internally, you'd import it here too:
// import Image from '@tiptap/extension-image';
import styles from './TextBlockEditor.module.css';

const TextBlockEditor = ({
  content = { "type": "doc", "content": [{ "type": "paragraph" }] }, // Expect TipTap JSON object as content default
  onUpdate,
  disabled = false,
  placeholder = 'Start writing...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false }
        // If TextBlockEditor is to support images itself, add:
        // image: { inline: false, allowBase64: true }, // Or configure as needed
      }),
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true })
      // If TextBlockEditor is to support images itself, add: Image,
    ],
    // Pass the TipTap JSON object directly
    content,
    editable: !disabled,
    onUpdate: (props) => {
      // --- THIS IS THE FIX ---
      // Now pass the JSON content of the editor, which will be a TipTap doc object.
      onUpdate?.({ editor: props.editor, json: props.editor.getJSON() }); // Pass full JSON
    },
    editorProps: {
      attributes: {
        class: styles.editor,
        'data-testid': 'text-editor'
      }
    }
  });

  // Update content when prop changes
  React.useEffect(() => {
    // Only update if editor exists, content has changed, AND content is a TipTap doc object
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(content) && content?.type === 'doc') {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  // Update disabled state
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const setHeading = useCallback((level) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run();
    } else {
      editor?.chain().focus().toggleHeading({ level }).run();
    }
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading editor...</div>
      </div>
    );
  }

  const isActive = (name, attributes = {}) => {
    return editor.isActive(name, attributes);
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
        <div className={styles.toolbarGroup}>
          <select
            className={styles.headingSelect}
            value={
              isActive('heading', { level: 2 }) ? '2' :
              isActive('heading', { level: 3 }) ? '3' :
              isActive('heading', { level: 4 }) ? '4' : '0'
            }
            onChange={(e) => setHeading(parseInt(e.target.value))}
            disabled={disabled}
            aria-label="Text style"
          >
            <option value="0">Paragraph</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
        </div>

        <div className={styles.toolbarSeparator} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={toggleBold}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('bold') ? styles.active : ''}`}
            aria-label="Bold"
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            onClick={toggleItalic}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('italic') ? styles.active : ''}`}
            aria-label="Italic"
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>

          <button
            type="button"
            onClick={toggleCode}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('code') ? styles.active : ''}`}
            aria-label="Inline code"
            title="Inline code"
          >
            &lt;/&gt;
          </button>
        </div>

        <div className={styles.toolbarSeparator} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={toggleBulletList}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('bulletList') ? styles.active : ''}`}
            aria-label="Bullet list"
            title="Bullet list"
          >
            •
          </button>

          <button
            type="button"
            onClick={toggleOrderedList}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('orderedList') ? styles.active : ''}`}
            aria-label="Numbered list"
            title="Numbered list"
          >
            1.
          </button>
        </div>

        <div className={styles.toolbarSeparator} />

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={toggleBlockquote}
            disabled={disabled}
            className={`${styles.toolbarButton} ${isActive('blockquote') ? styles.active : ''}`}
            aria-label="Quote"
            title="Quote"
          >
            "
          </button>

          <button
            type="button"
            onClick={insertHorizontalRule}
            disabled={disabled}
            className={styles.toolbarButton}
            aria-label="Horizontal line"
            title="Horizontal line"
          >
            ―
          </button>
        </div>
      </div>

      <div className={styles.editorWrapper}>
        <EditorContent
          editor={editor}
          className={styles.editorContent}
        />
      </div>
    </div>
  );
};

export default TextBlockEditor;