interface MediaItem {
  accountVisibility?: 'public' | 'private';
  id: string;
  name?: string;
  publicId?: string;
  secureUrl?: string;
  bytes?: number;
  status?: 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
}

interface MediaListProps {
  deniedActionMessage?: string;
  items: MediaItem[];
}

export function MediaList({ items, deniedActionMessage }: MediaListProps) {
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
    <>
      {deniedActionMessage ? (
        <div className="status-banner status-banner--warning" role="status">
          {deniedActionMessage || 'This action is unavailable for the current account context.'}
        </div>
      ) : null}
      <ul className="media-list">
        {items.map((item) => (
          <li key={item.id} className="list-card">
            <div className="list-card__body">
              <p className="list-card__title">{item.name ?? item.publicId ?? item.id}</p>
              <p className="list-card__meta">
                {item.bytes
                  ? `${item.bytes.toLocaleString()} bytes`
                  : (item.secureUrl ?? 'Protected media asset')}
              </p>
            </div>
            <span className="status-badge status-badge--info">{item.status ?? 'Ready'}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
