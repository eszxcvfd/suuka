import { useState } from 'react';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { MediaList } from '../../components/media/MediaList';
import { MediaUploader } from '../../components/media/MediaUploader';
import { AuthState } from '../../store/auth.store';

interface MediaItem {
  id: string;
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

  async function handleUpload(file: File): Promise<void> {
    setItems((current) => [
      { id: crypto.randomUUID(), name: file.name, bytes: file.size },
      ...current,
    ]);
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
            <MediaList items={items} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
