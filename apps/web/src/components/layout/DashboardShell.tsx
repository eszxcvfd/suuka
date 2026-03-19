import { ReactNode, useEffect, useId, useRef, useState } from 'react';
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuId = useId();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                aria-controls={profileMenuId}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                aria-label={`Open profile actions for ${displayName}`}
                className="user-chip user-chip--menu"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                type="button"
              >
                {renderAvatar('user-chip__avatar')}
                <span className="user-chip__text">
                  <span className="user-chip__name">{displayName}</span>
                  <span className="user-chip__meta">{handle}</span>
                </span>
                <span aria-hidden="true" className="profile-menu__chevron">
                  ▾
                </span>
              </button>
              {isProfileMenuOpen ? (
                <div
                  aria-label="Profile actions"
                  className="surface-card profile-menu__panel"
                  id={profileMenuId}
                  role="menu"
                >
                  <div className="profile-menu__summary">
                    <div className="profile-menu__identity">
                      {renderAvatar('profile-menu__avatar')}
                      <div className="profile-menu__text">
                        <p className="profile-menu__name">{displayName}</p>
                        <p className="profile-menu__handle">{handle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="profile-menu__actions">
                    <button
                      className="profile-menu__action"
                      onClick={() => {
                        auth.setMode('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {currentMode === 'profile' ? 'Profile settings' : 'Edit profile'}
                    </button>
                    <button
                      className="profile-menu__action profile-menu__action--danger"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        auth.signOut();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
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
