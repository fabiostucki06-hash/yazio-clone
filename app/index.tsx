import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useSyncStore } from '@/store/syncStore';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const session = useSyncStore((state) => state.session);
  const sessionChecked = useSyncStore((state) => state.sessionChecked);
  const [hasHydrated, setHasHydrated] = useState(useUserStore.persist.hasHydrated());

  useEffect(() => {
    if (hasHydrated) return;
    return useUserStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, [hasHydrated]);

  if (!hasHydrated || !sessionChecked) return null;

  return <Redirect href={session ? '/(tabs)' : '/onboarding'} />;
}
