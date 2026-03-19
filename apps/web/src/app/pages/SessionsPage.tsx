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
    <DashboardShell auth={auth} currentMode="sessions">
      <div className="page-shell dashboard-stack">
        <section className="surface-card section-panel page-section feed-hero">
          <header className="section-header">
            <div className="section-header__content">
              <span className="eyebrow-label">Account safety</span>
              <h1 className="section-header__title">Where you’re signed in</h1>
              <p className="section-header__text">
                Keep track of every phone, laptop, and browser currently connected to your creator
                account.
              </p>
            </div>
            <div className="page-actions page-actions--start">
              <button
                className="button button--outline"
                type="button"
                onClick={() => auth.setMode('media')}
              >
                Back to feed
              </button>
              <button
                className="button button--outline"
                type="button"
                disabled={isRevokingOthers}
                onClick={() => {
                  void handleRevokeOthers();
                }}
              >
                {isRevokingOthers ? 'Signing out others…' : 'Sign out other devices'}
              </button>
            </div>
          </header>
          <div className="page-panel feed-hero__footer">
            <div className="metric-strip" aria-label="Session summary">
              <span className="metric-chip">{auth.sessions.length} devices active</span>
              <span className="metric-chip">{otherSessions} additional logins</span>
              <span className="metric-chip">
                {currentSession?.deviceLabel ?? 'Current browser'}
              </span>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="surface-card section-panel page-section">
            <header className="section-header">
              <div className="section-header__content">
                <span className="eyebrow-label">Signed-in places</span>
                <h2 className="section-header__title">Device activity</h2>
                <p className="section-header__text">
                  Review connected devices and sign out anything that doesn’t belong in your daily
                  workflow.
                </p>
              </div>
            </header>
            <div className="page-panel">
              <SessionList
                sessions={auth.sessions}
                onRevoke={async (sessionId) => {
                  await auth.revokeSession(sessionId);
                }}
              />
            </div>
          </section>
          <aside className="sidebar-stack">
            <section className="surface-card section-panel social-note">
              <span className="eyebrow-label">Quick reminder</span>
              <h2 className="social-note__title">Creator accounts travel fast.</h2>
              <p className="social-note__text">
                If you log in from client machines or borrowed devices, clear them here as soon as
                the session is over.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
