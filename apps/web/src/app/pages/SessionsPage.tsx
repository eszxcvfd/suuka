import { useEffect, useState } from 'react';
import { SessionList } from '../../components/auth/SessionList';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { AuthState } from '../../store/auth.store';

interface SessionsPageProps {
  auth: AuthState;
}

export function SessionsPage({ auth }: SessionsPageProps) {
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  useEffect(() => {
    void auth.loadSessions();
  }, [auth]);

  const currentSession = auth.sessions.find((session) => session.isCurrent);
  const otherSessions = auth.sessions.filter((session) => !session.isCurrent).length;

  async function handleRevokeOthers(): Promise<void> {
    if (isRevokingOthers) {
      return;
    }

    setIsRevokingOthers(true);
    try {
      await auth.revokeOtherSessions(currentSession?.id);
    } finally {
      setIsRevokingOthers(false);
    }
  }

  return (
    <DashboardShell auth={auth}>
      <div className="page-shell dashboard-stack">
        <section className="surface-card section-panel page-section">
          <header className="section-header">
            <div className="section-header__content">
              <span className="eyebrow-label">Security</span>
              <h1 className="section-header__title">Active sessions</h1>
              <p className="section-header__text">
                Review current device access and revoke older sessions when needed.
              </p>
            </div>
            <div className="page-actions page-actions--start">
              <button
                className="button button--outline"
                type="button"
                onClick={() => auth.setMode('media')}
              >
                Media
              </button>
              <button
                className="button button--outline"
                type="button"
                disabled={isRevokingOthers}
                onClick={() => {
                  void handleRevokeOthers();
                }}
              >
                {isRevokingOthers ? 'Revoking others…' : 'Revoke others'}
              </button>
            </div>
          </header>

          <div className="page-panel">
            <div className="metric-strip" aria-label="Session summary">
              <span className="metric-chip">{auth.sessions.length} active</span>
              <span className="metric-chip">{otherSessions} additional devices</span>
            </div>
            <SessionList
              sessions={auth.sessions}
              onRevoke={async (sessionId) => {
                await auth.revokeSession(sessionId);
              }}
            />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
