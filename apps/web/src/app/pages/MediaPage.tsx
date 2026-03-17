import { useState } from 'react';
import { MediaList } from '../../components/media/MediaList';
import { MediaUploader } from '../../components/media/MediaUploader';

interface MediaItem {
  id: string;
  name: string;
  bytes: number;
}

export function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);

  async function handleUpload(file: File): Promise<void> {
    setItems((current) => [{ id: crypto.randomUUID(), name: file.name, bytes: file.size }, ...current]);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media</h1>
        <MediaUploader onUpload={handleUpload} />
      </div>
      <MediaList items={items} />
    </section>
  );
}
