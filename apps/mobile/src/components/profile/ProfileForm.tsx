import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

interface ProfileFormProps {
  bio: string;
  displayName: string;
  onSubmit: (payload: { bio: string; displayName: string }) => Promise<void>;
}

export function ProfileForm({ bio, displayName, onSubmit }: ProfileFormProps) {
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio);

  useEffect(() => {
    setDraftDisplayName(displayName);
  }, [displayName]);

  useEffect(() => {
    setDraftBio(bio);
  }, [bio]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Display name</Text>
      <TextInput style={styles.input} value={draftDisplayName} onChangeText={setDraftDisplayName} />
      <Text style={styles.label}>Bio</Text>
      <TextInput
        multiline
        numberOfLines={4}
        style={[styles.input, styles.multiline]}
        value={draftBio}
        onChangeText={setDraftBio}
      />
      <Button
        title="Save profile"
        onPress={() => void onSubmit({ bio: draftBio, displayName: draftDisplayName })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#0f172a',
    fontWeight: '600',
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
