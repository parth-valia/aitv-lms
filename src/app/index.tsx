import { Redirect } from 'expo-router';

export default function Index() {
  // We'll redirect to the catalog dashboard. Auth guarding will handle redirecting to login if necessary.
  return <Redirect href="/(tabs)" />;
}
