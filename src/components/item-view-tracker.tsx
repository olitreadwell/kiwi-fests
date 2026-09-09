'use client';

import { useEffect } from 'react';

/**
 * Fire-and-forget view counter: POSTs to /api/items/{id}/view once per
 * client render. Data drives the self-improvement loop in DB mode.
 *
 * @param itemId - Listing id
 * @returns Null; purely a tracking side effect
 */
export function ItemViewTracker({ itemId }: { itemId: string }): null {
  useEffect(() => {
    void fetch(`/api/items/${encodeURIComponent(itemId)}/view`, { method: 'POST' });
  }, [itemId]);
  return null;
}
