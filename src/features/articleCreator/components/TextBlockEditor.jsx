// src/features/articleCreator/components/TextBlockEditor.jsx

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import styles from './TextBlockEditor.module.css';

import Spinner from '../../../components/UI/Spinner/Spinner';
import Tooltip from '../../../components/UI/Tooltip/Tooltip'; // <-- IMPORT TOOLTIP

// Import our custom Tiptap Nodes
import TiptapImageNode from './TiptapImageNode';
import TiptapVideoNode from './TiptapVideoNode';

// Import NEW Icons
import {
  BoldIcon,
  ItalicIcon,
  CodeIcon,
  BulletListIcon,
  NumberedListIcon,
  QuoteIcon,
  HorizontalRuleIcon,
  ImageIcon,
  VideoIcon,
} from '../../../assets/icons';


// (The custom Tiptap Node definitions remain unchanged)
const CustomImage = Node.create({ name: 'image', group: 'block', atom: true, addAttributes() { return { src: { default: null, }, alt: { default: null, }, title: { default: null, }, }; }, parseHTML() { return [ { tag: 'img[src]', getAttrs: (dom) => ({ src: dom.getAttribute('src'), alt: dom.getAttribute('alt'), title: dom.getAttribute('title'), }), }, ]; }, renderHTML({ HTMLAttributes }) { return ['img', HTMLAttributes]; }, addNodeView() { return ReactNodeViewRenderer(TiptapImageNode); }, addCommands() { return { setImage: (options) => ({ commands }) => { return commands.insertContent({ type: this.name, attrs: options, }); }, }; }, });
const CustomVideo = Node.create({ name: 'video', group: 'block', atom: true, addAttributes() { return { src: { default: null, }, }; }, parseHTML() { return [ { tag: 'iframe', getAttrs: (dom) => ({ src: dom.getAttribute('src'), }), }, ]; }, renderHTML({ HTMLAttributes }) { return ['iframe', { ...HTMLAttributes, frameBorder: 0, allowFullScreen: '' }]; }, addNodeView() { return ReactNodeViewRenderer(TiptapVideoNode); }, addCommands() { return { setVideo: (options) => ({ commands }) => { return commands.insertContent({ type: this.name, attrs: options, }); }, }; }, });


const TextBlockEditor = ({
  content = { "type": "doc", "content": [{ "type": "paragraph" }] },
  onUpdate,
  disabled = false,
  placeholder = 'Start writing...'
}) => {
  const editor = useEditor({
    extensions: [ StarterKit.configure({ heading: { levels: [2, 3, 4] }, bulletList: { keepMarks: true, keepAttributes: false }, orderedList: { keepMarks: true, keepAttributes: false } }), Placeholder.configure({ placeholder, showOnlyWhenEditable: true }), CustomImage, CustomVideo, ],
    content,
    editable: !disabled,
    onUpdate: (props) => { onUpdate?.({ editor: props.editor, json: props.editor.getJSON() }); },
    editorProps: { attributes: { class: styles.editor, 'data-testid': 'text-editor' } }
  });

  // (All useEffects and useCallback hooks for editor actions remain unchanged)
  React.useEffect(() => { if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(content) && content?.type === 'doc') { editor.commands.setContent(content, false); } }, [editor, content]);
  React.useEffect(() => { if (editor) { editor.setEditable(!disabled); } }, [editor, disabled]);
  const toggleBold = useCallback(() => { editor?.chain().focus().toggleBold().run(); }, [editor]);
  const toggleItalic = useCallback(() => { editor?.chain().focus().toggleItalic().run(); }, [editor]);
  const toggleCode = useCallback(() => { editor?.chain().focus().toggleCode().run(); }, [editor]);
  const toggleBulletList = useCallback(() => { editor?.chain().focus().toggleBulletList().run(); }, [editor]);
  const toggleOrderedList = useCallback(() => { editor?.chain().focus().toggleOrderedList().run(); }, [editor]);
  const setHeading = useCallback((level) => { if (level === 0) { editor?.chain().focus().setParagraph().run(); } else { editor?.chain().focus().toggleHeading({ level }).run(); } }, [editor]);
  const toggleBlockquote = useCallback(() => { editor?.chain().focus().toggleBlockquote().run(); }, [editor]);
  const insertHorizontalRule = useCallback(() => { editor?.chain().focus().setHorizontalRule().run(); }, [editor]);
  const addImageNode = useCallback(() => { if (editor) { editor.chain().focus().setImage({ src: '' }).run(); } }, [editor]);
  const addVideoNode = useCallback(() => { if (editor) { editor.chain().focus().setVideo({ src: '' }).run(); } }, [editor]);


  if (!editor) {
    return ( <div className={styles.container}><div className={styles.loading}>Loading editor...</div></div> );
  }

  const isActive = (name, attributes = {}) => editor.isActive(name, attributes);

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.toolbar} role="toolbar" aria-label="Text formatting">
        <div className={styles.toolbarGroup}>
          <select className={styles.headingSelect} value={ isActive('heading', { level: 2 }) ? '2' : isActive('heading', { level: 3 }) ? '3' : isActive('heading', { level: 4 }) ? '4' : '0' } onChange={(e) => setHeading(parseInt(e.target.value))} disabled={disabled} aria-label="Text style">
            <option value="0">Paragraph</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
        </div>
        <div className={styles.toolbarSeparator} />
        <div className={styles.toolbarGroup}>
          <Tooltip content="Bold (Ctrl+B)"><button type="button" onClick={toggleBold} disabled={disabled} className={`${styles.toolbarButton} ${isActive('bold') ? styles.active : ''}`} aria-label="Bold"><BoldIcon /></button></Tooltip>
          <Tooltip content="Italic (Ctrl+I)"><button type="button" onClick={toggleItalic} disabled={disabled} className={`${styles.toolbarButton} ${isActive('italic') ? styles.active : ''}`} aria-label="Italic"><ItalicIcon /></button></Tooltip>
          <Tooltip content="Inline Code"><button type="button" onClick={toggleCode} disabled={disabled} className={`${styles.toolbarButton} ${isActive('code') ? styles.active : ''}`} aria-label="Inline code"><CodeIcon /></button></Tooltip>
        </div>
        <div className={styles.toolbarSeparator} />
        <div className={styles.toolbarGroup}>
          <Tooltip content="Bullet List"><button type="button" onClick={toggleBulletList} disabled={disabled} className={`${styles.toolbarButton} ${isActive('bulletList') ? styles.active : ''}`} aria-label="Bullet list"><BulletListIcon /></button></Tooltip>
          <Tooltip content="Numbered List"><button type="button" onClick={toggleOrderedList} disabled={disabled} className={`${styles.toolbarButton} ${isActive('orderedList') ? styles.active : ''}`} aria-label="Numbered list"><NumberedListIcon /></button></Tooltip>
        </div>
        <div className={styles.toolbarSeparator} />
        <div className={styles.toolbarGroup}>
          <Tooltip content="Blockquote"><button type="button" onClick={toggleBlockquote} disabled={disabled} className={`${styles.toolbarButton} ${isActive('blockquote') ? styles.active : ''}`} aria-label="Quote"><QuoteIcon /></button></Tooltip>
          <Tooltip content="Horizontal Rule"><button type="button" onClick={insertHorizontalRule} disabled={disabled} className={styles.toolbarButton} aria-label="Horizontal line"><HorizontalRuleIcon /></button></Tooltip>
          <Tooltip content="Add Image"><button type="button" onClick={addImageNode} disabled={disabled} className={styles.toolbarButton} aria-label="Add Image"><ImageIcon /></button></Tooltip>
          <Tooltip content="Add Video"><button type="button" onClick={addVideoNode} disabled={disabled} className={styles.toolbarButton} aria-label="Add Video"><VideoIcon /></button></Tooltip>
        </div>
      </div>
      <div className={styles.editorWrapper}><EditorContent editor={editor} className={styles.editorContent} /></div>
    </div>
  );
};

export default TextBlockEditor;