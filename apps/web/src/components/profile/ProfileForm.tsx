import { FormEvent, useEffect, useId, useState } from 'react';
import { ExternalLinksEditor } from './ExternalLinksEditor';

interface ExternalLinkValue {
  id: string;
  label: string;
  url: string;
}

interface ProfileFormProps {
  accountVisibility?: 'public' | 'private';
  avatarMediaId?: string | null;
  bio: string;
  displayName: string;
  externalLinks?: ExternalLinkValue[];
  isSaving?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (payload: {
    accountVisibility: 'public' | 'private';
    avatarMediaId: string | null;
    bio: string;
    displayName: string;
    externalLinks: ExternalLinkValue[];
    username: string;
  }) => Promise<void>;
  username?: string;
}

export function ProfileForm({
  accountVisibility = 'public',
  avatarMediaId = null,
  bio,
  displayName,
  externalLinks = [],
  isSaving = false,
  onDirtyChange,
  onSubmit,
  username = '',
}: ProfileFormProps) {
  const visibilityId = useId();
  const displayNameId = useId();
  const usernameId = useId();
  const bioId = useId();
  const avatarId = useId();
  const [draftAccountVisibility, setDraftAccountVisibility] = useState(accountVisibility);
  const [draftAvatarMediaId, setDraftAvatarMediaId] = useState(avatarMediaId ?? '');
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftExternalLinks, setDraftExternalLinks] = useState<ExternalLinkValue[]>(externalLinks);
  const [draftUsername, setDraftUsername] = useState(username);

  useEffect(() => {
    setDraftAccountVisibility(accountVisibility);
  }, [accountVisibility]);

  useEffect(() => {
    setDraftAvatarMediaId(avatarMediaId ?? '');
  }, [avatarMediaId]);

  useEffect(() => {
    setDraftDisplayName(displayName);
  }, [displayName]);

  useEffect(() => {
    setDraftBio(bio);
  }, [bio]);

  useEffect(() => {
    setDraftExternalLinks(externalLinks);
  }, [externalLinks]);

  useEffect(() => {
    setDraftUsername(username);
  }, [username]);

  useEffect(() => {
    onDirtyChange?.(
      draftAccountVisibility !== accountVisibility ||
        draftAvatarMediaId !== (avatarMediaId ?? '') ||
        draftDisplayName !== displayName ||
        draftBio !== bio ||
        draftUsername !== username ||
        JSON.stringify(draftExternalLinks) !== JSON.stringify(externalLinks),
    );
  }, [
    accountVisibility,
    avatarMediaId,
    bio,
    displayName,
    draftAccountVisibility,
    draftAvatarMediaId,
    draftBio,
    draftDisplayName,
    draftExternalLinks,
    draftUsername,
    externalLinks,
    onDirtyChange,
    username,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit({
      accountVisibility: draftAccountVisibility,
      avatarMediaId: draftAvatarMediaId.trim().length > 0 ? draftAvatarMediaId.trim() : null,
      bio: draftBio,
      displayName: draftDisplayName,
      externalLinks: draftExternalLinks,
      username: draftUsername,
    });
  }

  return (
    <form className="form-grid profile-form" onSubmit={(event) => void handleSubmit(event)}>
      <div className="profile-form__section">
        <div className="field">
          <label className="field-label" htmlFor={visibilityId}>
            Profile visibility
          </label>
          <select
            className="field-input"
            aria-label="Profile visibility"
            id={visibilityId}
            name="accountVisibility"
            onChange={(event) =>
              setDraftAccountVisibility(event.target.value as 'public' | 'private')
            }
            value={draftAccountVisibility}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <p className="field-support">
            Choose whether your uploads feel open to everyone or reserved for invited viewers.
          </p>
        </div>
      </div>

      <div className="profile-form__section profile-form__section--split">
        <div className="field">
          <label className="field-label" htmlFor={displayNameId}>
            Display name
          </label>
          <input
            className="field-input"
            id={displayNameId}
            name="displayName"
            onChange={(event) => setDraftDisplayName(event.target.value)}
            placeholder="How your name appears in the feed"
            value={draftDisplayName}
          />
          <p className="field-support">Use the name followers should remember at a glance.</p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor={usernameId}>
            Username
          </label>
          <input
            className="field-input"
            aria-label="Username"
            id={usernameId}
            name="username"
            onChange={(event) => setDraftUsername(event.target.value)}
            placeholder="your.handle"
            value={draftUsername}
          />
          <p className="field-support">
            Handles turn your profile into something easy to tag, share, and remember.
          </p>
        </div>
      </div>

      <div className="profile-form__section">
        <div className="field">
          <label className="field-label" htmlFor={bioId}>
            Bio
          </label>
          <textarea
            className="field-input field-input--multiline"
            id={bioId}
            name="bio"
            onChange={(event) => setDraftBio(event.target.value)}
            placeholder="Tell people what you make, what you post, and why they should stick around."
            rows={4}
            value={draftBio}
          />
          <p className="field-support">
            A good bio reads like the caption that hooks someone into following you.
          </p>
        </div>
      </div>

      <div className="profile-form__section profile-form__section--split">
        <div className="field">
          <label className="field-label" htmlFor={avatarId}>
            Avatar media ID
          </label>
          <input
            className="field-input"
            aria-label="Avatar media ID"
            id={avatarId}
            name="avatarMediaId"
            onChange={(event) => setDraftAvatarMediaId(event.target.value)}
            placeholder="Attach a media upload as your avatar"
            value={draftAvatarMediaId}
          />
          <p className="field-support">
            Paste the media ID for the image you want anchoring your creator card.
          </p>
        </div>
      </div>

      <ExternalLinksEditor links={draftExternalLinks} onChange={setDraftExternalLinks} />
      <div className="form-actions page-actions--start">
        <button className="button button--primary" disabled={isSaving} type="submit">
          Save profile
        </button>
      </div>
    </form>
  );
}
