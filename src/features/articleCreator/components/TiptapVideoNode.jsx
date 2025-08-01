// src/features/articleCreator/components/TiptapVideoNode.jsx

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import VideoBlock from './VideoBlock';

const TiptapVideoNode = ({ node, updateAttributes, deleteNode }) => {
  const handleUrlChange = (newUrl) => {
    if (newUrl) {
      updateAttributes({ src: newUrl });
    } else {
      // If the URL is cleared, remove the entire node from the editor
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="video-node-wrapper">
      <VideoBlock
        initialUrl={node.attrs.src}
        onUrlChange={handleUrlChange}
      />
    </NodeViewWrapper>
  );
};

export default TiptapVideoNode;