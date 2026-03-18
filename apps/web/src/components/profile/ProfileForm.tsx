import { FormEvent, useEffect, useState } from 'react';
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
    <form className="stack-form" onSubmit={(event) => void handleSubmit(event)}>
      <label className="field-group">
        <span>Profile visibility</span>
        <select
          aria-label="Profile visibility"
          name="accountVisibility"
          onChange={(event) =>
            setDraftAccountVisibility(event.target.value as 'public' | 'private')
          }
          value={draftAccountVisibility}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </label>
      <label className="field-group">
        <span>Display name</span>
        <input
          name="displayName"
          onChange={(event) => setDraftDisplayName(event.target.value)}
          value={draftDisplayName}
        />
      </label>
      <label className="field-group">
        <span>Username</span>
        <input
          aria-label="Username"
          name="username"
          onChange={(event) => setDraftUsername(event.target.value)}
          value={draftUsername}
        />
      </label>
      <label className="field-group">
        <span>Bio</span>
        <textarea
          name="bio"
          onChange={(event) => setDraftBio(event.target.value)}
          value={draftBio}
        />
      </label>
      <label className="field-group">
        <span>Avatar media ID</span>
        <input
          aria-label="Avatar media ID"
          name="avatarMediaId"
          onChange={(event) => setDraftAvatarMediaId(event.target.value)}
          placeholder="Avatar"
          value={draftAvatarMediaId}
        />
      </label>
      <ExternalLinksEditor links={draftExternalLinks} onChange={setDraftExternalLinks} />
      <button className="button" disabled={isSaving} type="submit">
        Save profile
      </button>
    </form>
  );
}
