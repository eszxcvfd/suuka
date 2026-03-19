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

function getStatusLabel(status: MediaItem['status']): string {
  switch (status) {
    case 'uploaded':
      return 'Uploaded';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Needs attention';
    case 'deleted':
      return 'Removed';
    case 'ready':
    default:
      return 'Ready to share';
  }
}

function getStatusTone(status: MediaItem['status']): string {
  switch (status) {
    case 'failed':
      return ' status-badge--danger';
    case 'processing':
      return ' status-badge--warning';
    case 'deleted':
      return ' status-badge--neutral';
    case 'uploaded':
    case 'ready':
    default:
      return ' status-badge--info';
  }
}

export function MediaList({ items, deniedActionMessage }: MediaListProps) {
  if (!items.length) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-state__title">No posts shared yet.</p>
        <p className="empty-state__text">
          Share your first photo or clip to start building the public shape of your feed.
        </p>
      </div>
    );
  }

  return (
    <>
      {deniedActionMessage ? (
        <div className="status-banner status-banner--warning" role="status">
          {deniedActionMessage ||
            'Some posts stay hidden in this view because the account is private.'}
        </div>
      ) : null}
      <ul className="media-list">
        {items.map((item) => (
          <li key={item.id} className="list-card media-card">
            <div className="media-card__preview" aria-hidden="true">
              {item.secureUrl ? (
                <img alt="" className="media-card__image" loading="lazy" src={item.secureUrl} />
              ) : (
                <div className="media-card__fallback">
                  {(item.name ?? item.publicId ?? 'S').slice(0, 1)}
                </div>
              )}
            </div>
            <div className="media-card__body">
              <div className="media-card__headline">
                <div className="list-card__body">
                  <p className="list-card__title">{item.name ?? item.publicId ?? item.id}</p>
                  <p className="list-card__meta">
                    {item.bytes
                      ? `${item.bytes.toLocaleString()} bytes`
                      : (item.secureUrl ?? 'Protected media asset')}
                  </p>
                </div>
                <span className={`status-badge${getStatusTone(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="metric-strip">
                <span className="metric-chip">
                  {item.accountVisibility === 'private' ? 'Private audience' : 'Public audience'}
                </span>
                <span className="metric-chip">{item.publicId ?? item.id}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
