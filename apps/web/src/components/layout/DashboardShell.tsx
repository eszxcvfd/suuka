import { ReactNode } from 'react';
import { AuthState } from '../../store/auth.store';

type DashboardMode = 'media' | 'profile' | 'sessions';

interface DashboardShellProps {
  auth: AuthState;
  children: ReactNode;
  currentMode: DashboardMode;
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

const navigationItems: Array<{
  description: string;
  label: string;
  mode: DashboardMode;
}> = [
  { description: 'Latest drops', label: 'Feed', mode: 'media' },
  { description: 'Signed-in devices', label: 'Devices', mode: 'sessions' },
  { description: 'Creator card', label: 'Profile', mode: 'profile' },
];

export function DashboardShell({ auth, children, currentMode }: DashboardShellProps) {
  const displayName = auth.user?.displayName ?? 'Suuka creator';
  const handle = auth.user?.username ? `@${auth.user.username}` : (auth.user?.email ?? 'Creator');

  function renderAvatar(sizeClassName: string): ReactNode {
    if (auth.user?.avatarUrl) {
      return <img alt="" className={sizeClassName} src={auth.user.avatarUrl} />;
    }

    return (
      <span className={sizeClassName} aria-hidden="true">
        {getInitials(displayName)}
      </span>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <button
            aria-label="Open the Suuka feed"
            className="brand brand--button"
            onClick={() => auth.setMode('media')}
            type="button"
          >
            <span className="brand__mark" aria-hidden="true">
              S
            </span>
            <span className="brand__text">
              <span>Suuka</span>
              <span className="brand__eyebrow">Creator network</span>
            </span>
          </button>
          <div className="topbar__meta">
            <div className="user-chip" aria-label={`Signed in as ${displayName}`}>
              {renderAvatar('user-chip__avatar')}
              <span className="user-chip__text">
                <span className="user-chip__name">{displayName}</span>
                <span className="user-chip__meta">{handle}</span>
              </span>
            </div>
            {currentMode !== 'profile' ? (
              <button
                className="button button--outline"
                type="button"
                onClick={() => auth.setMode('profile')}
              >
                Edit profile
              </button>
            ) : null}
            <button className="button button--outline" type="button" onClick={auth.signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="shell-frame">
        <aside className="surface-card rail-nav" aria-label="Primary navigation">
          <div className="rail-nav__header">
            <div className="rail-nav__avatar">{renderAvatar('rail-nav__avatar-image')}</div>
            <div className="rail-nav__identity">
              <p className="rail-nav__title">{displayName}</p>
              <p className="rail-nav__handle">{handle}</p>
            </div>
          </div>
          <div className="rail-nav__list">
            {navigationItems.map((item) => {
              const isActive = item.mode === currentMode;

              return (
                <button
                  key={item.mode}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rail-nav__item${isActive ? ' rail-nav__item--active' : ''}`}
                  onClick={() => auth.setMode(item.mode)}
                  type="button"
                >
                  <span className="rail-nav__item-label">{item.label}</span>
                  <span className="rail-nav__item-description">{item.description}</span>
                </button>
              );
            })}
          </div>
          <div className="rail-nav__summary">
            <p className="rail-nav__summary-title">Stay social-first</p>
            <p className="rail-nav__summary-text">
              Shape your public identity, keep your feed fresh, and review device safety without
              leaving the creator flow.
            </p>
          </div>
        </aside>
        <main id="main-content" className="shell-main">
          {children}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav__inner">
          {navigationItems.map((item) => {
            const isActive = item.mode === currentMode;

            return (
              <button
                key={item.mode}
                aria-current={isActive ? 'page' : undefined}
                className={`mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`}
                onClick={() => auth.setMode(item.mode)}
                type="button"
              >
                <span className="mobile-nav__label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
