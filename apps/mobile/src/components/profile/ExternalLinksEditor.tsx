import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

interface ExternalLinkValue {
  id: string;
  label: string;
  url: string;
}

interface ExternalLinksEditorProps {
  links: ExternalLinkValue[];
  onChange: (links: ExternalLinkValue[]) => void;
}

export function ExternalLinksEditor({ links, onChange }: ExternalLinksEditorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>External links</Text>
      {links.map((link, index) => (
        <View key={link.id} style={styles.linkGroup}>
          <TextInput
            placeholder={`Label ${index + 1}`}
            style={styles.input}
            value={link.label}
            onChangeText={(value) => {
              const updated = [...links];
              updated[index] = { ...link, label: value };
              onChange(updated);
            }}
          />
          <TextInput
            placeholder="https://example.com"
            style={styles.input}
            value={link.url}
            onChangeText={(value) => {
              const updated = [...links];
              updated[index] = { ...link, url: value };
              onChange(updated);
            }}
          />
        </View>
      ))}
      <Button
        title="Add link"
        onPress={() =>
          onChange([...links, { id: `link-${links.length + 1}`, label: '', url: 'https://' }])
        }
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
  linkGroup: {
    gap: 8,
  },
});
