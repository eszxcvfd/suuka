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
          setErrorMessage('Access limited by visibility policy.');
        } else {
          setErrorMessage('Unable to load workspace media right now.');
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

  return (
    <DashboardShell auth={auth}>
      <div className="page-shell dashboard-stack">
        <section className="surface-card section-panel page-section">
          <header className="section-header">
            <div className="section-header__content">
              <span className="eyebrow-label">Workspace media</span>
              <h1 className="section-header__title">Media</h1>
              <p className="section-header__text">
                Upload and review the assets currently available in your workspace.
              </p>
            </div>
            <div className="page-actions page-actions--start">
              <button
                className="button button--outline"
                type="button"
                onClick={() => auth.setMode('sessions')}
              >
                Sessions
              </button>
              <MediaUploader onUpload={handleUpload} />
            </div>
          </header>
          <div className="page-panel">
            <div className="metric-strip" aria-label="Media summary">
              <span className="metric-chip">{items.length} files</span>
              <span className="metric-chip">{formatBytes(totalBytes)}</span>
            </div>
            {isLoading ? (
              <div className="empty-state" role="status">
                <p className="empty-state__title">Loading visible media…</p>
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
                isDenied ? 'This action is unavailable for the current account context.' : undefined
              }
            />
            {isDenied ? <p className="helper-text">Access limited by visibility policy.</p> : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
