import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useUserStore } from '@/store/userStore';

export default function Index() {
  const hasOnboarded = useUserStore((state) => state.hasOnboarded);
  const [hasHydrated, setHasHydrated] = useState(useUserStore.persist.hasHydrated());

  useEffect(() => {
    if (hasHydrated) return;
    return useUserStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, [hasHydrated]);

  if (!hasHydrated) return null;

  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}
