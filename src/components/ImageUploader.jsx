// File: src/components/ImageUploader.jsx
// Purpose: Photo picker with drag & drop, validation and preview.
// Used by: components/ItemForm.jsx

import { useRef, useState } from 'react';
import { compressImage } from '../utils/imageUtils';
import { validateImageFile } from '../utils/validation';
import { cx } from '../utils/helpers';
import Icon from './Icon';

// 1536 → "1.5 KB", 2400000 → "2.3 MB"
const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// Choose or drag-and-drop a photo. It is previewed and stored as a data URL (no server).
export default function ImageUploader({ image, onChange, error, onError }) {
  const fileInputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [sizeInfo, setSizeInfo] = useState(null); // { before, after } in bytes

  const handleFile = async (file) => {
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setProcessing(true);
    try {
      const dataUrl = await compressImage(file); // FileReader + canvas, see utils/imageUtils.js
      onChange(dataUrl);
      // A Base64 data URL is about 4/3 the size of the bytes it holds
      setSizeInfo({ before: file.size, after: Math.round((dataUrl.length * 3) / 4) });
      onError('');
    } catch (err) {
      onError(err?.message ?? 'Failed to process image');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // allow choosing the same file again
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="image-uploader">
      {image ? (
        <div className="image-uploader__preview">
          <img src={image} alt="Preview of the uploaded item" />
          <div>
            <p><strong>Photo added</strong></p>
            <p className="muted">
              {sizeInfo
                ? `Compressed from ${formatBytes(sizeInfo.before)} to ${formatBytes(sizeInfo.after)} to save browser storage.`
                : 'It will be resized and stored in your browser.'}
            </p>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange(null)}>
              <Icon name="delete" /> Remove photo
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image"
          className={cx('dropzone', dragging && 'is-dragging', error && 'has-error')}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Icon name={processing ? 'progress_activity' : 'add_photo_alternate'} className={cx('dropzone__icon', processing && 'spin')} />
          <span className="dropzone__title">{processing ? 'Processing image…' : 'Click to upload or drag a photo here'}</span>
          <span className="muted">PNG, JPG, WEBP or GIF · up to 5 MB · optional</span>
        </label>
      )}
      <input
        ref={fileInputRef}
        id="image"
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
        aria-describedby={error ? 'image-error' : undefined}
      />
      {error && <p id="image-error" className="field-error" role="alert" aria-live="polite">{error}</p>}
    </div>
  );
}
