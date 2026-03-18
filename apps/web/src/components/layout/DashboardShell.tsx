import { ReactNode } from 'react';
import { AuthState } from '../../store/auth.store';

interface DashboardShellProps {
  auth: AuthState;
  children: ReactNode;
}

function getInitials(displayName: string | undefined): string {
  if (!displayName) {
    return 'SU';
  }

  return displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardShell({ auth, children }: DashboardShellProps) {
  const displayName = auth.user?.displayName ?? 'Signed in user';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand" aria-label="Suuka home">
            <span className="brand__mark" aria-hidden="true">
              S
            </span>
            <span className="brand__text">
              <span>Suuka</span>
              <span className="brand__eyebrow">Workspace</span>
            </span>
          </div>
          <div className="topbar__meta">
            <div className="user-chip" aria-label={`Signed in as ${displayName}`}>
              <span className="user-chip__avatar" aria-hidden="true">
                {getInitials(displayName)}
              </span>
              <span>{displayName}</span>
            </div>
            <button
              className="button button--outline"
              type="button"
              onClick={() => auth.setMode('profile')}
            >
              Profile
            </button>
            <button className="button button--outline" type="button" onClick={auth.signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" className="shell-main">
        {children}
      </main>
    </div>
  );
}
