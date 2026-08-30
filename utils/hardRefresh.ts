export async function clearCachesAndReload() {
  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // best-effort cache clear; still reload below
    }
  }
  window.location.reload();
}
