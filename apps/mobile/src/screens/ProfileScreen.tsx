import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ExternalLinksEditor } from '../components/profile/ExternalLinksEditor';
import { ProfileForm } from '../components/profile/ProfileForm';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth.service';

const authService = new AuthService(new ApiClient());

interface ExternalLinkValue {
  id: string;
  label: string;
  url: string;
}

export function ProfileScreen() {
  const [accountVisibility, setAccountVisibility] = useState<'public' | 'private'>('public');
  const [avatarMediaId, setAvatarMediaId] = useState('');
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [externalLinks, setExternalLinks] = useState<ExternalLinkValue[]>([]);
  const [hiddenProfileMessage] = useState('This profile is not available.');
  const [username, setUsername] = useState('');
  const [viewerAccountId] = useState<string | null>(null);

  useEffect(() => {
    const loader = viewerAccountId
      ? authService.getProfileByAccountId(viewerAccountId)
      : authService.getProfile();

    void loader
      .then((profile) => {
        setAccountVisibility(profile.accountVisibility ?? 'public');
        setAvatarMediaId(profile.avatarMediaId ?? '');
        setBio(profile.bio ?? '');
        setDisplayName(profile.displayName ?? '');
        setExternalLinks(profile.externalLinks ?? []);
        setUsername(profile.username ?? '');
      })
      .catch(() => undefined);
  }, [viewerAccountId]);

  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        {viewerAccountId ? 'Profile' : 'Profile settings'}
      </Text>
      <Text style={{ fontWeight: '600' }}>Profile visibility</Text>
      {viewerAccountId ? (
        <Text>{hiddenProfileMessage}</Text>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setAccountVisibility('public')}>
            <Text>{accountVisibility === 'public' ? 'Public ✓' : 'Public'}</Text>
          </Pressable>
          <Pressable onPress={() => setAccountVisibility('private')}>
            <Text>{accountVisibility === 'private' ? 'Private ✓' : 'Private'}</Text>
          </Pressable>
        </View>
      )}
      <Text style={{ fontWeight: '600' }}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <ProfileForm
        bio={bio}
        displayName={displayName}
        onSubmit={async (payload) => {
          const profile = await authService.updateProfile({
            accountVisibility,
            ...payload,
            externalLinks,
            username,
          });
          const avatarProfile = await authService.updateAvatar({
            mediaId: avatarMediaId.trim().length > 0 ? avatarMediaId.trim() : null,
          });
          setAccountVisibility(profile.accountVisibility ?? accountVisibility);
          setBio(profile.bio ?? '');
          setDisplayName(profile.displayName ?? avatarProfile.displayName ?? '');
          setExternalLinks(profile.externalLinks ?? avatarProfile.externalLinks ?? []);
          setUsername(profile.username ?? avatarProfile.username ?? '');
        }}
      />
      <Text style={{ fontWeight: '600' }}>Avatar media ID</Text>
      <TextInput placeholder="Avatar" value={avatarMediaId} onChangeText={setAvatarMediaId} />
      <ExternalLinksEditor links={externalLinks} onChange={setExternalLinks} />
    </View>
  );
}
