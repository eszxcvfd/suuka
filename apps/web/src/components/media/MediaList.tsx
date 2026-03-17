interface MediaItem {
  id: string;
  name: string;
  bytes: number;
}

interface MediaListProps {
  items: MediaItem[];
}

export function MediaList({ items }: MediaListProps) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">No media uploaded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded border border-slate-200 p-3">
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-slate-500">{item.bytes} bytes</p>
        </li>
      ))}
    </ul>
  );
}
