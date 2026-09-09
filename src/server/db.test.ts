import { describe, expect, it } from 'vitest';
import { createAuthDatabase, userTable } from '@/server/db';

describe('createAuthDatabase', () => {
  it('creates the auth tables and persists rows', async () => {
    const db = createAuthDatabase(':memory:');
    const inserted = await db
      .insert(userTable)
      .values({
        id: 'user-1',
        name: 'Ada',
        email: 'ada@example.com',
        emailVerified: false,
        createdAt: 1,
        updatedAt: 1,
      })
      .returning();
    expect(inserted[0].email).toBe('ada@example.com');

    const rows = await db.select().from(userTable);
    expect(rows).toHaveLength(1);
  });
});
