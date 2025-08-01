// src/features/articleCreator/components/TextBlockEditor.jsx

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import styles from './TextBlockEditor.module.css';

import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/UI/Spinner/Spinner';
import UploadIcon from '../../../assets/icons/UploadIcon';

// Import our custom Tiptap Nodes
import TiptapImageNode from './TiptapImageNode';
import TiptapVideoNode from './TiptapVideoNode'; // 👈 NEW

// Define a custom Image Extension that uses our TiptapImageNode
const CustomImage = Node.create({
  name: 'image', // Must match the name of TipTap's default image node
  group: 'block', // Can be block or inline
  atom: true, // This node is treated as a single unit in the editor

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => ({
          src: dom.getAttribute('src'),
          alt: dom.getAttribute('alt'),
          title: dom.getAttribute('title'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  // This is where we tell TipTap to use our React component for rendering this node
  addNodeView() {
    return ReactNodeViewRenderer(TiptapImageNode);
  },

  // Add commands if you want custom ways to interact with it, e.g., to insert
  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// 👇 NEW: Define a custom Video Extension
const CustomVideo = Node.create({
  name: 'video', // A unique name for your node
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe', // So it can parse pasted iframe embeds
        getAttrs: (dom) => ({
          src: dom.getAttribute('src'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // This is a fallback and will be overridden by our rendering logic on the article page
    return ['iframe', { ...HTMLAttributes, frameBorder: 0, allowFullScreen: '' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TiptapVideoNode);
  },

  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});


const TextBlockEditor = ({
  content = { "type": "doc", "content": [{ "type": "paragraph" }] },
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
      }),
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true }),
      CustomImage,
      CustomVideo, // 👈 ADDED
    ],
    content,
    editable: !disabled,
    onUpdate: (props) => {
      onUpdate?.({ editor: props.editor, json: props.editor.getJSON() });
    },
    editorProps: {
      attributes: {
        class: styles.editor,
        'data-testid': 'text-editor'
      }
    }
  });

  React.useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(content) && content?.type === 'doc') {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

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

  const addImageNode = useCallback(() => {
    if (editor) {
      editor.chain().focus().setImage({ src: '' }).run();
    }
  }, [editor]);

  // 👇 NEW: Function to add an empty video node
  const addVideoNode = useCallback(() => {
    if (editor) {
      editor.chain().focus().setVideo({ src: '' }).run();
    }
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
          
          <button
            type="button"
            onClick={addImageNode}
            disabled={disabled}
            className={styles.toolbarButton}
            aria-label="Add Image"
            title="Add Image"
          >
            <UploadIcon />
          </button>

          {/* 👇 NEW BUTTON FOR VIDEO 👇 */}
          <button
            type="button"
            onClick={addVideoNode}
            disabled={disabled}
            className={styles.toolbarButton}
            aria-label="Add Video"
            title="Add Video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.323a.75.75 0 00-.75-.75h-.365a.75.75 0 01-.53-1.28l2.404-2.405a.75.75 0 011.06 0l2.405 2.405a.75.75 0 01-.53 1.28H6.5a.75.75 0 00-.75.75v4.323a.75.75 0 001.5 0V2.75z" />
              <path d="M10.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0V2.75z" />
              <path d="M16.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.323a.75.75 0 00-.75-.75h-.365a.75.75 0 01-.53-1.28l2.404-2.405a.75.75 0 011.06 0l2.405 2.405a.75.75 0 01-.53 1.28H18.5a.75.75 0 00-.75.75v4.323a.75.75 0 001.5 0V2.75z" />
            </svg>
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