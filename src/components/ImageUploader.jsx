import { useRef, useState } from 'react';
import { compressImage } from '../utils/imageUtils';
import { validateImageFile } from '../utils/validation';
import { cx } from '../utils/helpers';
import Icon from './Icon';

// Choose or drag-and-drop a photo. It is previewed and stored as a data URL (no server).
export default function ImageUploader({ image, onChange, error, onError }) {
  const fileInputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);

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
      onError('');
    } catch (err) {
      onError(err.message);
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
            <p className="muted">It will be resized and stored in your browser.</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange(null)}>
              <Icon name="delete" /> Remove photo
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image"
          className={cx('dropzone', dragging && 'is-dragging', error && 'has-error')}
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
      {error && <p id="image-error" className="field-error">{error}</p>}
    </div>
  );
}
