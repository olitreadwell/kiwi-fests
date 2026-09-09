import { ImageResponse } from 'next/og';
import { getArtistBySlug } from '@/lib/festival-data';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Artist card';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const artist = getArtistBySlug(slug);

  const name = artist?.name ?? 'Aotearoa Festivals';
  const subtitle = artist ? [artist.homeCity, artist.genre].filter(Boolean).join(' · ') : '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#171717',
        color: '#f5f5f5',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        {name}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: '#a3a3a3',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>,
    { ...size }
  );
}
