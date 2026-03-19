import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { MediaList } from '../../components/media/MediaList';
import { MediaUploader } from '../../components/media/MediaUploader';
import { AuthState } from '../../store/auth.store';
import { isAuthorizationDeniedError } from '../../services/auth-api';

interface MediaItem {
  accountVisibility?: 'public' | 'private';
  id: string;
  publicId?: string;
  secureUrl?: string;
  status?: 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
  name: string;
  bytes: number;
}

interface MediaPageProps {
  auth: AuthState;
}

function formatBytes(bytes: number): string {
  return `${bytes.toLocaleString()} bytes`;
}

export function MediaPage({ auth }: MediaPageProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMedia(): Promise<void> {
      if (!auth.isAuthenticated) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setIsDenied(false);

      try {
        const visibleItems = await auth.loadMedia();
        if (!active) {
          return;
        }

        setItems(
          visibleItems.map((item) => ({
            ...item,
            name: item.publicId,
            bytes: 0,
          })),
        );
      } catch (error) {
        if (!active) {
          return;
        }

        if (isAuthorizationDeniedError(error)) {
          setIsDenied(true);
          setErrorMessage('Some posts stay hidden because this profile is private.');
        } else {
          setErrorMessage('Unable to refresh your creator feed right now.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadMedia();

    return () => {
      active = false;
    };
  }, [auth]);

  async function handleUpload(file: File): Promise<void> {
    const uploaded = await auth.uploadMedia(file);
    setItems((current) => [{ ...uploaded, name: file.name, bytes: file.size }, ...current]);
  }

  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);
  const readyCount = items.filter((item) => item.status === 'ready').length;
  const privateCount = items.filter((item) => item.accountVisibility === 'private').length;
  const latestItem = items[0];

  return (
    <DashboardShell auth={auth} currentMode="media">
      <div className="page-shell dashboard-stack social-feed">
        <section className="surface-card section-panel page-section feed-hero">
          <header className="section-header">
            <div className="section-header__content">
              <span className="eyebrow-label">Creator feed</span>
              <h1 className="section-header__title feed-hero__title">
                Your latest drops, ready to post.
              </h1>
              <p className="section-header__text">
                Turn every upload into a polished post, reel, or preview for your audience.
              </p>
            </div>
            <div className="page-actions page-actions--start">
              <button
                className="button button--outline"
                type="button"
                onClick={() => auth.setMode('profile')}
              >
                Open profile
              </button>
              <MediaUploader onUpload={handleUpload} />
            </div>
          </header>
          <div className="page-panel feed-hero__footer">
            <div className="metric-strip" aria-label="Media summary">
              <span className="metric-chip">{items.length} posts</span>
              <span className="metric-chip">{readyCount} ready to share</span>
              <span className="metric-chip">{privateCount} private-only</span>
              <span className="metric-chip">{formatBytes(totalBytes)}</span>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="surface-card section-panel page-section">
            <header className="section-header">
              <div className="section-header__content">
                <span className="eyebrow-label">Recent uploads</span>
                <h2 className="section-header__title">Feed preview</h2>
                <p className="section-header__text">
                  Review what followers can see right now and keep your profile visually active.
                </p>
              </div>
              <div className="page-actions page-actions--start">
                <button
                  className="button button--outline"
                  type="button"
                  onClick={() => auth.setMode('sessions')}
                >
                  Device activity
                </button>
              </div>
            </header>
            <div className="page-panel">
              {isLoading ? (
                <div className="empty-state" role="status">
                  <p className="empty-state__title">Loading your feed…</p>
                </div>
              ) : null}
              {!isLoading && errorMessage && !isDenied ? (
                <div className="status-banner status-banner--danger" role="alert">
                  {errorMessage}
                </div>
              ) : null}
              <MediaList
                items={items}
                deniedActionMessage={
                  isDenied
                    ? 'Some posts stay hidden in this view because the account is private.'
                    : undefined
                }
              />
              {isDenied ? (
                <p className="helper-text">
                  Switch back to the owner account or open visibility settings to review every post.
                </p>
              ) : null}
            </div>
          </section>

          <aside className="sidebar-stack">
            <section className="surface-card section-panel social-note">
              <span className="eyebrow-label">Profile vibe</span>
              <h2 className="social-note__title">Keep the grid feeling alive.</h2>
              <p className="social-note__text">
                Alternate polished hero assets with quick behind-the-scenes uploads so your feed
                never feels static.
              </p>
            </section>
            <section className="surface-card section-panel social-note">
              <span className="eyebrow-label">Latest drop</span>
              <h2 className="social-note__title">
                {latestItem?.name ?? latestItem?.publicId ?? 'Nothing posted yet'}
              </h2>
              <p className="social-note__text">
                {latestItem
                  ? `Newest upload is ${latestItem.status ?? 'ready'} and available for your next share.`
                  : 'Upload a photo or clip to start building your public grid.'}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
