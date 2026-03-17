import { ChangeEvent } from 'react';

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export function MediaUploader({ onUpload }: MediaUploaderProps) {
  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await onUpload(selectedFile);
      event.target.value = '';
    }
  }

  return (
    <label className="inline-flex cursor-pointer rounded bg-slate-900 px-4 py-2 text-white">
      Upload media
      <input className="hidden" type="file" onChange={handleChange} />
    </label>
  );
}
