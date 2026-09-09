'use client';

import { useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), {
  ssr: false,
});

type Fest = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  genre: string | null;
  region: string | null;
  status: string;
};

export default function HomeMap({ festivals }: { festivals: Fest[] }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    import('leaflet/dist/leaflet.css');
  }, []);

  if (!mounted) return <div className="h-64 w-full animate-pulse rounded-xl bg-muted lg:h-full" />;

  return (
    <MapContainer
      center={[-40.9, 174.9]}
      zoom={6}
      minZoom={5}
      maxZoom={14}
      className="h-64 w-full lg:h-full"
      zoomControl={true}
      scrollWheelZoom={true}
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {festivals.map((f) => (
        <Marker key={f.id} position={[f.latitude, f.longitude]}>
          <Popup>
            <a href={`/festivals/${f.slug}`} className="text-sm font-medium">
              {f.name}
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
