import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/hello/route';

describe('GET /api/hello', () => {
  it('greets the default name', async () => {
    const response = GET(new Request('http://localhost/api/hello'));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: 'Hello, World!' });
  });

  it('rejects empty names with 400', async () => {
    const response = GET(new Request('http://localhost/api/hello?name='));
    expect(response.status).toBe(400);
  });
});
