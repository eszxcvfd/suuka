import { ScrollView, Text, View } from 'react-native';
import { MediaCard } from '../components/media/MediaCard';

const DEMO_MEDIA = [
  { id: '1', name: 'example-1.jpg', secureUrl: 'https://res.cloudinary.com/demo/example-1.jpg' },
  { id: '2', name: 'example-2.jpg', secureUrl: 'https://res.cloudinary.com/demo/example-2.jpg' },
];

export function MediaListScreen() {
  const visibleItems = DEMO_MEDIA.filter(Boolean);

  return (
    <View style={{ flex: 1, gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>My media</Text>
      <Text style={{ color: '#64748b' }}>Protected media is unavailable for this account.</Text>
      <ScrollView>
        <View style={{ gap: 10 }}>
          {!visibleItems.length ? <Text>No visible media yet.</Text> : null}
          {visibleItems.map((item) => (
            <MediaCard key={item.id} name={item.name} secureUrl={item.secureUrl} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
