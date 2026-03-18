import { useEffect, useState } from 'react';
import type { ProfileDetails } from '../../services/auth-api';
import { DashboardShell } from '../../components/layout/DashboardShell';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { AuthState } from '../../store/auth.store';

interface ProfilePageProps {
  auth: AuthState;
  viewerAccountId?: string;
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
    <DashboardShell auth={auth}>
      <div className="page-shell dashboard-stack">
        <section className="surface-card section-panel page-section">
          <header className="section-header">
            <div className="section-header__content">
              <span className="eyebrow-label">Workspace profile</span>
              <h1 className="section-header__title">
                {isViewerMode ? 'Profile' : 'Profile settings'}
              </h1>
              <p className="section-header__text">
                {isViewerMode
                  ? 'View the public profile details available for this account.'
                  : 'Update your owner profile details for the workspace.'}
              </p>
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
                Back to media
              </button>
            </div>
          </header>
          <div className="page-panel">
            {auth.isProfileLoading ? (
              <div className="status-banner" role="status">
                Loading profile...
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
                This profile is not available.
              </div>
            ) : null}
            {isViewerMode ? (
              profile && !auth.profileError ? (
                <div className="stack-form">
                  <p>
                    <strong>Profile visibility</strong>: {profile.accountVisibility}
                  </p>
                  <p>
                    <strong>Display name</strong>: {profile.displayName}
                  </p>
                  <p>
                    <strong>Username</strong>: {profile.username ?? '—'}
                  </p>
                  <p>
                    <strong>Bio</strong>: {profile.bio}
                  </p>
                </div>
              ) : null
            ) : (
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
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
