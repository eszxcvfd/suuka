import { useState } from 'react';
import { SessionInfo } from '../../services/auth-api';

interface SessionListProps {
  onRevoke: (sessionId: string) => Promise<void>;
  sessions: SessionInfo[];
}

export function SessionList({ sessions, onRevoke }: SessionListProps) {
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  async function handleRevoke(sessionId: string): Promise<void> {
    if (pendingSessionId) {
      return;
    }

    setPendingSessionId(sessionId);
    try {
      await onRevoke(sessionId);
    } finally {
      setPendingSessionId(null);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-state__title">No signed-in devices found.</p>
        <p className="empty-state__text">
          The next phone, browser, or laptop that signs in will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <ul className="session-list">
      {sessions.map((session) => (
        <li key={session.id} className="list-card session-card">
          <div className="list-card__body">
            <p className="list-card__title">{session.deviceLabel}</p>
            <p className="list-card__meta">
              {session.isCurrent ? 'This device' : 'Recent activity'} ·{' '}
              {new Date(session.lastActivityAt).toLocaleString()}
            </p>
          </div>
          {session.isCurrent ? (
            <span className="status-badge">This device</span>
          ) : (
            <div className="list-card__actions">
              <button
                className="button button--danger"
                type="button"
                disabled={pendingSessionId !== null}
                onClick={() => {
                  void handleRevoke(session.id);
                }}
              >
                {pendingSessionId === session.id ? 'Signing out…' : 'Sign out device'}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
