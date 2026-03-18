import { ChangeEvent, useId, useState } from 'react';

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setIsUploading(true);
      try {
        await onUpload(selectedFile);
        event.target.value = '';
      } finally {
        setIsUploading(false);
      }
    }
  }

  return (
    <div className="upload-control">
      <input
        id={inputId}
        className="upload-input"
        type="file"
        disabled={isUploading}
        onChange={handleChange}
      />
      <label
        className="button button--primary upload-trigger"
        htmlFor={inputId}
        aria-disabled={isUploading}
      >
        {isUploading ? 'Uploading…' : 'Upload media'}
      </label>
    </div>
  );
}
