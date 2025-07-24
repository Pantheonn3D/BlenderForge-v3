import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './CreateArticlePage.module.css';
import { useAuth } from '../context/AuthContext';
import { createArticle, getArticleBySlug, updateArticle } from '../services/articleService';
import Button from '../components/UI/Button/Button';
import Spinner from '../components/UI/Spinner/Spinner';
import ImageBlock from '../features/articleCreator/components/ImageBlock';
import TextBlockEditor from '../features/articleCreator/components/TextBlockEditor';
import UploadIcon from '../assets/icons/UploadIcon';
import { CreateIcon, XMarkIcon } from '../assets/icons';

// Constants and Utilities
const TITLE_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 160;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BLOCKS = 50;
const MIN_READ_TIME = 1;
const MAX_READ_TIME = 999;

const generateUniqueId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- MODIFIED UTILITY FUNCTIONS for TipTap Content Conversion ---

// Converts your custom blocks array into a single TipTap `doc` object for storage.
// It assumes TextBlockEditor gives a TipTap JSON object for its content.
const convertBlocksToTiptapDoc = (blocksArray) => {
  const contentNodes = [];

  blocksArray.forEach(block => {
    if (block.type === 'text') {
      // TextBlockEditor gives a TipTap JSON doc object (e.g., {type: "doc", content: [...]})
      // We need to extract the actual content nodes from this doc and add them.
      if (block.content && block.content.type === 'doc' && Array.isArray(block.content.content)) {
        contentNodes.push(...block.content.content);
      }
    } else if (block.type === 'image' && block.content) {
      // Image block content is a URL string, convert to TipTap image node
      contentNodes.push({ type: 'image', attrs: { src: block.content } });
    }
  });

  // Ensure contentNodes is not empty, otherwise generateHTML might complain
  return {
    type: 'doc',
    content: contentNodes.length > 0 ? contentNodes : [{ type: 'paragraph' }]
  };
};

// Converts a stored TipTap `doc` JSON object back into your custom blocks array for editing.
const convertTiptapDocToBlocks = (tiptapDoc) => {
  if (!tiptapDoc || !tiptapDoc.content || !Array.isArray(tiptapDoc.content)) {
    return [{ id: generateUniqueId(), type: 'text', content: { "type": "doc", "content": [{ "type": "paragraph" }] } }];
  }

  const newBlocks = [];
  let currentTextBlockContentNodes = []; // Accumulate nodes for the current TextBlockEditor

  tiptapDoc.content.forEach(node => {
    if (node.type === 'image') {
      // If there's accumulated text, save it as a TextBlockEditor block first
      if (currentTextBlockContentNodes.length > 0) {
        newBlocks.push({
          id: generateUniqueId(),
          type: 'text',
          content: { type: 'doc', content: currentTextBlockContentNodes }
        });
        currentTextBlockContentNodes = []; // Reset for next text block
      }
      // Add the image block
      newBlocks.push({ id: generateUniqueId(), type: 'image', content: node.attrs?.src || '' });
    } else {
      // Accumulate all other node types into the current text block
      currentTextBlockContentNodes.push(node);
    }
  });

  // Add any remaining accumulated text as a final text block
  if (currentTextBlockContentNodes.length > 0) {
    newBlocks.push({
      id: generateUniqueId(),
      type: 'text',
      content: { type: 'doc', content: currentTextBlockContentNodes }
    });
  }

  // If no blocks were found, return a default empty text block
  if (newBlocks.length === 0) {
    return [{ id: generateUniqueId(), type: 'text', content: { "type": "doc", "content": [{ "type": "paragraph" }] } }];
  }

  return newBlocks;
};

const parseReadTime = (readTimeString) => {
  if (typeof readTimeString !== 'string') return '';
  const match = readTimeString.match(/^(\d+)/);
  return match ? match[1] : '';
};

const CreateArticlePage = () => {
  const { slug } = useParams();
  const isEditMode = Boolean(slug);
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const thumbnailUrlRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tutorial');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [readTime, setReadTime] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  // Initial state for blocks: one text block with an empty TipTap doc structure
  const [blocks, setBlocks] = useState([{ id: generateUniqueId(), type: 'text', content: { "type": "doc", "content": [{ "type": "paragraph" }] } }]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isEditMode && slug && user) {
      const fetchArticleData = async () => {
        setIsLoading(true);
        try {
          const article = await getArticleBySlug(slug);
          if (article) {
            if (article.user_id !== user.id) {
              alert("You are not authorized to edit this article.");
              navigate('/');
              return;
            }
            setTitle(article.title);
            setDescription(article.description);
            setCategory(article.category);
            setDifficulty(article.difficulty);
            setReadTime(parseReadTime(article.read_time));
            setThumbnailPreview(article.image_url);
            // MODIFIED: Parse the article.content from the database (which should be TipTap JSON)
            // and convert it back to your custom blocks array structure.
            try {
              const parsedContent = typeof article.content === 'string' ? JSON.parse(article.content) : article.content;
              setBlocks(convertTiptapDocToBlocks(parsedContent));
            } catch (e) {
              console.error("Error parsing article content for editor:", e);
              // Fallback to a single empty text block on error
              setBlocks([{ id: generateUniqueId(), type: 'text', content: { "type": "doc", "content": [{ "type": "paragraph" }] } }]);
            }
          } else {
            alert("Article not found.");
            navigate('/knowledge-base');
          }
        } catch (error) {
          console.error("Failed to fetch article for editing:", error);
          setErrors({ general: "Failed to load article data." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchArticleData();
    }
  }, [slug, isEditMode, navigate, user]);

  const cleanupThumbnail = useCallback(() => {
    if (thumbnailUrlRef.current) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
      thumbnailUrlRef.current = null;
    }
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return { valid: false, error: 'No file selected' };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { valid: false, error: 'Invalid file type.' };
    if (file.size > MAX_FILE_SIZE) return { valid: false, error: 'File too large (max 5MB).' };
    return { valid: true, error: null };
  }, []);

  // hasContent now checks for actual content within the TipTap JSON structures
  const hasContent = useMemo(() => {
    return blocks.some(b => {
      if (b.type === 'text' && b.content && b.content.type === 'doc' && Array.isArray(b.content.content)) {
        // Check if any paragraph has text content
        return b.content.content.some(node =>
          node.type === 'paragraph' && node.content?.some(textNode => textNode.type === 'text' && textNode.text.trim().length > 0)
        );
      }
      if (b.type === 'image' && b.content) {
        return true; // Image block has content (a URL)
      }
      return false;
    });
  }, [blocks]);

  const isFormValid = useMemo(() => {
    const hasRequired = title.trim() && description.trim() && readTime &&
      (thumbnailFile || thumbnailPreview) && hasContent;
    return hasRequired && Object.keys(errors).length === 0;
  }, [title, description, readTime, thumbnailFile, thumbnailPreview, hasContent, errors]);

  const validateForm = useCallback((isSubmitting = false) => {
    const newErrors = {};

    if (touched.title || isSubmitting) {
      if (!title.trim()) {
        newErrors.title = 'Title is required.';
      } else if (title.length > TITLE_MAX_LENGTH) {
        newErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less.`;
      }
    }

    if (touched.description || isSubmitting) {
      if (!description.trim()) {
        newErrors.description = 'Description is required.';
      } else if (description.length > DESCRIPTION_MAX_LENGTH) {
        newErrors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`;
      }
    }

    if (touched.readTime || isSubmitting) {
      const readTimeNum = parseInt(readTime, 10);
      if (!readTime) {
        newErrors.readTime = 'Read time is required.';
      } else if (isNaN(readTimeNum)) {
        newErrors.readTime = 'Invalid number.';
      } else if (readTimeNum < MIN_READ_TIME) {
        newErrors.readTime = `Read time must be at least ${MIN_READ_TIME} minute.`;
      } else if (readTimeNum > MAX_READ_TIME) {
        newErrors.readTime = `Read time cannot exceed ${MAX_READ_TIME} minutes.`;
      }
    }

    if (touched.thumbnail || isSubmitting) {
      if (!thumbnailPreview && !thumbnailFile) {
        newErrors.thumbnail = 'Thumbnail is required.';
      } else if (thumbnailFile) {
        const { valid, error } = validateFile(thumbnailFile);
        if (!valid) newErrors.thumbnail = error;
      }
    }

    if (touched.content || isSubmitting) {
      if (!hasContent) {
        newErrors.content = 'Article must have content.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, readTime, thumbnailFile, thumbnailPreview, hasContent, touched, validateFile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        validateForm();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [touched, validateForm]);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= TITLE_MAX_LENGTH) {
      setTitle(value);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  };

  const handleReadTimeChange = (e) => {
    const value = e.target.value;
    const num = parseInt(value, 10);
    if (value === '' || (!isNaN(num) && num >= 0 && num <= MAX_READ_TIME)) {
      setReadTime(value);
    }
  };

  const handlePublish = useCallback(async () => {
    if (isPublishing) return;

    setTouched({
      title: true,
      description: true,
      readTime: true,
      thumbnail: true,
      content: true
    });

    if (!validateForm(true)) {
      alert("Please correct the errors before publishing.");
      return;
    }

    setIsPublishing(true);
    setErrors({});

    try {
      if (!user) throw new Error('You must be logged in.');

      // MODIFIED: Convert custom blocks array to single Tiptap doc for saving
      const fullTiptapDoc = convertBlocksToTiptapDoc(blocks);

      const articleData = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        readTime: parseInt(readTime, 10),
        content: JSON.stringify(fullTiptapDoc), // Store as JSON string of TipTap Doc
        user_id: user.id,
        image_url: thumbnailPreview
      };

      if (isEditMode) {
        await updateArticle(slug, articleData, thumbnailFile);
        navigate(`/knowledge-base/${category.toLowerCase()}/${slug}`, {
          state: { message: 'Article updated successfully!', type: 'success' }
        });
      } else {
        await createArticle(articleData, thumbnailFile, user.id);
        navigate('/', {
          state: { message: 'Article published successfully!', type: 'success' }
        });
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setErrors({ general: error.message || 'An unknown error occurred.' });
    } finally {
      setIsPublishing(false);
    }
  }, [isPublishing, validateForm, user, title, description, category, difficulty, readTime, blocks, thumbnailFile, navigate, isEditMode, slug, thumbnailPreview]);

  const handleThumbnailChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTouched(prev => ({ ...prev, thumbnail: true }));

    const { valid, error } = validateFile(file);
    if (!valid) {
      setErrors(prev => ({ ...prev, thumbnail: error }));
      return;
    }

    setThumbnailFile(file);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.thumbnail;
      return newErrors;
    });

    cleanupThumbnail();
    const url = URL.createObjectURL(file);
    thumbnailUrlRef.current = url;
    setThumbnailPreview(url);
  }, [cleanupThumbnail, validateFile]);

  const handleThumbnailRemove = useCallback((e) => {
    e.stopPropagation();
    setThumbnailFile(null);
    cleanupThumbnail();
    setThumbnailPreview('');
    setTouched(prev => ({ ...prev, thumbnail: true }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [cleanupThumbnail]);

  const addBlock = useCallback((type) => {
    if (blocks.length < MAX_BLOCKS) {
      const newBlock = { id: generateUniqueId(), type };
      if (type === 'text') {
        // Text block content is now an empty TipTap doc object
        newBlock.content = { "type": "doc", "content": [{ "type": "paragraph" }] };
      } else { // image block
        newBlock.content = ''; // Image URL
      }
      setBlocks(prev => [...prev, newBlock]);
      setTouched(prev => ({ ...prev, content: true }));
    }
  }, [blocks.length]);

  // MODIFIED: updateBlockContent now expects Tiptap JSON for text blocks, URL for image blocks
  const updateBlockContent = useCallback((id, newContent) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === id) {
        // If it's a TextBlockEditor, newContent is the TipTap JSON (props.editor.getJSON()).
        // If it's an ImageBlock, newContent is the URL string (from onUpload).
        return { ...b, content: newContent };
      }
      return b;
    }));
    setTouched(prev => ({ ...prev, content: true }));
  }, []);

  const removeBlock = useCallback((id) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(b => b.id !== id));
      setTouched(prev => ({ ...prev, content: true }));
    }
  }, [blocks.length]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isEditMode ? 'Edit Article' : 'Create a New Article'}
        </h1>
        <p className={styles.subtitle}>
          {isEditMode ? `Now editing: ${title}` : 'Share your knowledge with the community.'}
        </p>
      </header>

      <div className={styles.contentWrapper}>
        {errors.general && (
          <div className={styles.errorBanner}>
            <span>{errors.general}</span>
          </div>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Article Details</h2>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="title" className={styles.label}>Title*</label>
              <span className={`${styles.counter} ${title.length > TITLE_MAX_LENGTH * 0.8 ? styles.warning : ''}`}>
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
              className={`${styles.input} ${errors.title && touched.title ? styles.error : ''}`}
              placeholder="Enter a compelling title for your article"
            />
            {errors.title && touched.title && (
              <p className={styles.errorText}>{errors.title}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="description" className={styles.label}>Description*</label>
              <span className={`${styles.counter} ${description.length > DESCRIPTION_MAX_LENGTH * 0.8 ? styles.warning : ''}`}>
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
              className={`${styles.textarea} ${errors.description && touched.description ? styles.error : ''}`}
              placeholder="Write a brief description of what readers will learn"
              rows={3}
            />
            {errors.description && touched.description && (
              <p className={styles.errorText}>{errors.description}</p>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>Category</label>
              <div className={styles.selectWrapper}>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="Tutorial">Tutorial</option>
                  <option value="Workflow">Workflow</option>
                  <option value="Guide">Guide</option>
                  <option value="News">News</option>
                </select>
                <div className={styles.selectArrow}>▼</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="difficulty" className={styles.label}>Difficulty</label>
              <div className={styles.selectWrapper}>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={styles.select}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <div className={styles.selectArrow}>▼</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="readTime" className={styles.label}>
                Read Time (minutes)*
              </label>
              <input
                id="readTime"
                type="number"
                min={MIN_READ_TIME}
                max={MAX_READ_TIME}
                value={readTime}
                onChange={handleReadTimeChange}
                onBlur={() => setTouched(prev => ({ ...prev, readTime: true }))}
                className={`${styles.input} ${errors.readTime && touched.readTime ? styles.error : ''}`}
                placeholder="5"
              />
              {errors.readTime && touched.readTime && (
                <p className={styles.errorText}>{errors.readTime}</p>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Thumbnail*</label>
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleThumbnailChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />

            <div
              className={styles.thumbnailUploader}
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <div className={styles.thumbnailPreview}>
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                  <div className={styles.thumbnailActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Change
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleThumbnailRemove}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.uploadIcon}>
                    <UploadIcon />
                  </div>
                  <p>Upload Thumbnail</p>
                  <span>PNG, JPG, WebP, or GIF (max 5MB)</span>
                </div>
              )}
            </div>

            {errors.thumbnail && touched.thumbnail && (
              <p className={styles.errorText}>{errors.thumbnail}</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Article Content</h2>
          <p className={styles.sectionSubtitle}>
            Create engaging content using text and image blocks. You can add up to {MAX_BLOCKS} blocks.
          </p>

          <div className={styles.blocksContainer}>
            {blocks.map((block) => (
              <div key={block.id} className={styles.block}>
                <div className={styles.blockContent}>
                  <div className={styles.blockEditor}>
                    {block.type === 'text' ? (
                      <TextBlockEditor
                        content={block.content} // Content is now TipTap JSON
                        onUpdate={(props) => updateBlockContent(block.id, props.editor.getJSON())} // Pass TipTap JSON
                      />
                    ) : (
                      <ImageBlock
                        initialUrl={block.content || ''}
                        onUpload={(url) => updateBlockContent(block.id, url)}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.blockControls}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                    disabled={blocks.length <= 1}
                    title="Remove block"
                  >
                    <XMarkIcon style={{ width: '1em', height: '1em' }} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.blockAddMenu}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => addBlock('text')}
              disabled={blocks.length >= MAX_BLOCKS}
              leftIcon={<CreateIcon />}
            >
              Add Text Block
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => addBlock('image')}
              disabled={blocks.length >= MAX_BLOCKS}
              leftIcon={<CreateIcon />}
            >
              Add Image Block
            </Button>
          </div>

          {blocks.length >= MAX_BLOCKS && (
            <p className={styles.helperText}>
              Maximum number of blocks reached ({MAX_BLOCKS})
            </p>
          )}

          {errors.content && touched.content && (
            <p className={styles.errorText}>{errors.content}</p>
          )}
        </section>

        <section className={styles.publishSection}>
          <div className={styles.publishActions}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(isEditMode ? `/knowledge-base/${category.toLowerCase()}/${slug}` : '/')}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePublish}
              disabled={isPublishing || !isFormValid}
            >
              {isPublishing ? (
                <>
                  <Spinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                isEditMode ? 'Update Article' : 'Publish Article'
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreateArticlePage;