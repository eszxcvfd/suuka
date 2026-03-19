import { useEffect, useState } from 'react';
import type { ProfileDetails } from '../../services/auth-api';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { AuthState } from '../../store/auth.store';

interface ProfilePageProps {
  auth: AuthState;
  viewerAccountId?: string;
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

export function ProfilePage({ auth, viewerAccountId }: ProfilePageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewerProfile, setViewerProfile] = useState<ProfileDetails | null>(null);

  useEffect(() => {
    if (viewerAccountId) {
      void auth
        .loadProfileByAccountId(viewerAccountId)
        .then((profile) => setViewerProfile(profile))
        .catch(() => setViewerProfile(null));
      return;
    }

    void auth.loadProfile().catch(() => undefined);
  }, [viewerAccountId]);

  const profile = viewerProfile ?? auth.user;
  const isViewerMode = Boolean(viewerAccountId);
  const displayName = profile?.displayName ?? auth.user?.displayName ?? 'Suuka creator';
  const handle = profile?.username ? `@${profile.username}` : '@new.creator';
  const visibilityLabel =
    profile?.accountVisibility === 'private' ? 'Private profile' : 'Public profile';
  const profileLinks = profile?.externalLinks ?? [];
  const bio = profile?.bio?.trim().length
    ? profile.bio
    : 'Introduce your creative point of view so people know what to expect in your feed.';

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <DashboardShell auth={auth} currentMode="profile">
      <div className="page-shell dashboard-stack">
        <section className="surface-card section-panel page-section profile-masthead">
          <header className="section-header">
            <div className="profile-masthead__identity">
              <div className="profile-avatar" aria-hidden="true">
                {profile?.avatarUrl ? (
                  <img alt="" className="profile-avatar__image" src={profile.avatarUrl} />
                ) : (
                  <span className="profile-avatar__fallback">{getInitials(displayName)}</span>
                )}
              </div>
              <div className="section-header__content">
                <span className="eyebrow-label">
                  {isViewerMode ? 'Creator profile' : 'Your creator card'}
                </span>
                <h1 className="section-header__title">{displayName}</h1>
                <p className="profile-handle">
                  {handle} · {visibilityLabel}
                </p>
                <p className="section-header__text profile-bio">{bio}</p>
                <div className="metric-strip" aria-label="Profile summary">
                  <span className="metric-chip">{visibilityLabel}</span>
                  <span className="metric-chip">{profileLinks.length} links pinned</span>
                  <span className="metric-chip">
                    {profile?.avatarMediaId ? 'Avatar connected' : 'Avatar not connected'}
                  </span>
                </div>
                {profileLinks.length ? (
                  <div className="profile-link-list">
                    {profileLinks.map((link) => (
                      <a
                        className="profile-link-pill"
                        href={link.url}
                        key={link.id}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label || link.url}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="page-actions page-actions--start">
              <button
                className="button button--outline"
                onClick={() => {
                  if (isDirty && !window.confirm('Discard unsaved profile changes?')) {
                    return;
                  }
                  auth.setMode('media');
                }}
                type="button"
              >
                Back to feed
              </button>
              {!isViewerMode ? (
                <button
                  className="button button--outline"
                  onClick={() => auth.setMode('sessions')}
                  type="button"
                >
                  Open devices
                </button>
              ) : null}
            </div>
          </header>
        </section>

        <section className="page-section">
          <div className="page-panel">
            {auth.isProfileLoading ? (
              <div className="status-banner" role="status">
                Loading creator profile…
              </div>
            ) : null}
            {auth.profileError ? (
              <div className="status-banner status-banner--danger" role="alert">
                {auth.profileError}
              </div>
            ) : null}
            {auth.profileSuccessMessage ? (
              <div className="status-banner status-banner--success" role="status">
                {auth.profileSuccessMessage}
              </div>
            ) : null}
            {isViewerMode && auth.profileError ? (
              <div className="status-banner" role="status">
                This creator card is not available.
              </div>
            ) : null}
            {isViewerMode ? (
              profile && !auth.profileError ? (
                <div className="profile-view-grid">
                  <article className="surface-card section-panel social-note">
                    <span className="eyebrow-label">Identity</span>
                    <h2 className="social-note__title">Profile details</h2>
                    <p className="social-note__text">Display name: {profile.displayName}</p>
                    <p className="social-note__text">
                      Username: {profile.username ?? 'Not set yet'}
                    </p>
                    <p className="social-note__text">Visibility: {profile.accountVisibility}</p>
                  </article>
                  <article className="surface-card section-panel social-note">
                    <span className="eyebrow-label">Bio</span>
                    <h2 className="social-note__title">What this creator shares</h2>
                    <p className="social-note__text">{bio}</p>
                  </article>
                  <article className="surface-card section-panel social-note">
                    <span className="eyebrow-label">Links</span>
                    <h2 className="social-note__title">Pinned destinations</h2>
                    {profileLinks.length ? (
                      <div className="profile-link-list">
                        {profileLinks.map((link) => (
                          <a
                            className="profile-link-pill"
                            href={link.url}
                            key={link.id}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {link.label || link.url}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="social-note__text">No external links have been added yet.</p>
                    )}
                  </article>
                </div>
              ) : null
            ) : (
              <div className="profile-layout">
                <section className="surface-card section-panel page-section">
                  <header className="section-header">
                    <div className="section-header__content">
                      <span className="eyebrow-label">Edit profile</span>
                      <h2 className="section-header__title">Tune your public identity</h2>
                      <p className="section-header__text">
                        Update the name, bio, visibility, and links your audience sees first.
                      </p>
                    </div>
                  </header>
                  <ProfileForm
                    accountVisibility={profile?.accountVisibility ?? 'public'}
                    avatarMediaId={profile?.avatarMediaId ?? null}
                    bio={profile?.bio ?? ''}
                    displayName={profile?.displayName ?? ''}
                    externalLinks={profile?.externalLinks ?? []}
                    isSaving={isSaving}
                    onDirtyChange={setIsDirty}
                    onSubmit={async (payload) => {
                      setIsSaving(true);
                      try {
                        await auth.saveProfile({
                          accountVisibility: payload.accountVisibility,
                          bio: payload.bio,
                          displayName: payload.displayName,
                          externalLinks: payload.externalLinks,
                          username: payload.username,
                        });
                        await auth.updateAvatar({ mediaId: payload.avatarMediaId });
                        setIsDirty(false);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    username={profile?.username ?? ''}
                  />
                </section>
                <aside className="sidebar-stack">
                  <section className="surface-card section-panel social-note">
                    <span className="eyebrow-label">Profile pacing</span>
                    <h2 className="social-note__title">Strong social profiles read in seconds.</h2>
                    <p className="social-note__text">
                      Keep your bio specific, your handle memorable, and your links limited to the
                      places you want people to visit next.
                    </p>
                  </section>
                  <section className="surface-card section-panel social-note">
                    <span className="eyebrow-label">Live summary</span>
                    <h2 className="social-note__title">What people notice first</h2>
                    <p className="social-note__text">{displayName}</p>
                    <p className="social-note__text">{handle}</p>
                    <p className="social-note__text">{visibilityLabel}</p>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
