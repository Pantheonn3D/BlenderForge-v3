// src/features/articleCreator/components/VideoBlock.jsx

import React, { useState, useMemo } from 'react';
import styles from './VideoBlock.module.css';
import Button from '../../../components/UI/Button/Button';

const getYouTubeId = (url) => {
  if (!url) return null;
  // This regex handles standard, shorts, and embed links
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const VideoBlock = ({ initialUrl = '', onUrlChange, readOnly = false }) => {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const videoId = useMemo(() => getYouTubeId(initialUrl), [initialUrl]);

  const handleSetUrl = (e) => {
    e.preventDefault();
    const newVideoId = getYouTubeId(inputUrl);
    if (newVideoId) {
      // 👇 CHANGE: Use the ad-blocker friendly youtube-nocookie.com domain
      onUrlChange(`https://www.youtube.com/embed/${newVideoId}`);
    } else {
      alert('Invalid YouTube URL. Please provide a valid video, short, or embed link.');
    }
  };
  
  const handleRemove = () => {
    setInputUrl('');
    onUrlChange(''); // Notify parent that the URL is now empty
  };

  if (videoId && !readOnly) {
    return (
       <div className={styles.preview}>
        <div className={styles.embedWrapper}>
            <iframe
                // 👇 CHANGE: Use the ad-blocker friendly youtube-nocookie.com domain
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded YouTube Video"
            ></iframe>
        </div>
        <Button 
            variant="danger" 
            onClick={handleRemove} 
            className={styles.removeButton}
            aria-label="Remove video"
        >
            ×
        </Button>
      </div>
    );
  }
  
  if (readOnly) return null; // Don't render the form in the final article page

  return (
    <div className={styles.container}>
      <form onSubmit={handleSetUrl} className={styles.form}>
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste a YouTube video or shorts link..."
          className={styles.input}
          aria-label="YouTube video URL"
        />
        <Button type="submit" variant="primary">Embed</Button>
      </form>
    </div>
  );
};

export default VideoBlock;