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
    return (
      <div className="empty-state" role="status">
        <p className="empty-state__title">No media uploaded yet.</p>
        <p className="empty-state__text">
          Upload files to start building a shared workspace library.
        </p>
      </div>
    );
  }

  return (
    <ul className="media-list">
      {items.map((item) => (
        <li key={item.id} className="list-card">
          <div className="list-card__body">
            <p className="list-card__title">{item.name}</p>
            <p className="list-card__meta">{item.bytes.toLocaleString()} bytes</p>
          </div>
          <span className="status-badge status-badge--info">Ready</span>
        </li>
      ))}
    </ul>
  );
}
