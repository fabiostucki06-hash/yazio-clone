import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSyncStore } from '@/store/syncStore';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const session = useSyncStore((state) => state.session);
  const sessionChecked = useSyncStore((state) => state.sessionChecked);
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const [hasHydrated, setHasHydrated] = useState(useUserStore.persist.hasHydrated());

  useEffect(() => {
    if (hasHydrated) return;
    return useUserStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, [hasHydrated]);

  if (!hasHydrated || !sessionChecked) return null;

  const destination = !session ? '/onboarding' : hasOnboarded ? '/(tabs)' : '/setup';
  return <Redirect href={destination} />;
}
