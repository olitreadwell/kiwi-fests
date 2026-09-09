'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Region } from '@/lib/festival-types';
import { formatRegion } from '@/lib/format';

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

type FestivalMarker = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  genre: string | null;
  region: Region | null;
  status: string;
};

const NZ_CENTER: [number, number] = [-40.9, 174.9];
const NZ_BOUNDS: [[number, number], [number, number]] = [
  [-47.5, 166.0],
  [-34.0, 179.0],
];

const GENRE_COLORS: Record<string, string> = {
  'Drum & Bass': '#a3172e',
  House: '#6b0f1e',
  Electronic: '#a37710',
  NYE: '#0a4a54',
  Reggae: '#287028',
  Dub: '#287028',
  Jazz: '#a37710',
  Rock: '#6b0f1e',
  Pop: '#a3172e',
  'Hip Hop': '#107080',
};
function genreColor(g: string | null): string {
  if (!g) return '#6e747c';
  for (const [k, v] of Object.entries(GENRE_COLORS)) if (g.includes(k)) return v;
  return '#6e747c';
}

export default function MapPage({ festivals }: { festivals: FestivalMarker[] }) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [icons, setIcons] = useState<Record<string, L.DivIcon>>({} as Record<string, L.DivIcon>);

  useEffect(() => {
    import('leaflet/dist/leaflet.css');
    import('leaflet').then((L) => {
      setMounted(true);
      setIcons(
        Object.fromEntries(
          Object.entries(GENRE_COLORS).map(([k, v]) => [
            k,
            L.divIcon({
              className: '',
              html: `<div style="background:${v};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            }),
          ])
        )
      );
    });
  }, []);

  const filtered = useMemo(() => {
    let result = festivals;
    if (filterRegion) result = result.filter((f) => f.region === filterRegion);
    if (filterStatus) result = result.filter((f) => f.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.genre?.toLowerCase().includes(q) ||
          (f.region && formatRegion(f.region).toLowerCase().includes(q))
      );
    }
    return result;
  }, [festivals, search, filterRegion, filterStatus]);

  const regions = useMemo(
    () => [...new Set(festivals.map((f) => f.region).filter(Boolean))].sort(),
    [festivals]
  );

  if (!mounted) {
    return (
      <main
        className="mx-auto min-h-screen max-w-6xl px-4 py-8"
        role="main"
        aria-label="Map loading"
      >
        <h1 className="text-2xl font-bold sm:text-3xl">Festival Map</h1>
        <div
          className="mt-4 h-96 animate-pulse rounded-xl bg-muted dark:bg-muted"
          aria-busy="true"
        />
      </main>
    );
  }

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:flex-row"
      role="main"
      aria-label="Interactive festival map"
    >
      {/* Map area */}
      <div
        className="relative flex-1"
        style={{ minHeight: '50dvh' }}
        role="application"
        aria-label="Map"
      >
        <MapContainer
          center={NZ_CENTER}
          zoom={6}
          maxBounds={NZ_BOUNDS}
          minZoom={5}
          maxZoom={14}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {filtered.map((f) => (
            <Marker
              key={f.id}
              position={[f.latitude, f.longitude]}
              title={f.name}
              icon={(icons[f.genre ?? ''] ?? icons['Rock'])!}
              keyboard={true}
            >
              <Popup>
                <div className="min-w-[160px] text-sm">
                  <strong className="block">{f.name}</strong>
                  {f.genre && (
                    <span className="block text-xs text-muted-foreground">{f.genre}</span>
                  )}
                  {f.region && (
                    <span className="block text-xs text-muted-foreground">
                      {formatRegion(f.region)}
                    </span>
                  )}
                  <Link
                    href={`/festivals/${f.slug}`}
                    className="mt-1 block text-xs font-medium text-primary hover:underline"
                  >
                    View festival →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <aside
        className="flex w-full shrink-0 flex-col border-t border-border bg-card dark:border-border dark:bg-card lg:w-80 lg:border-l lg:border-t-0"
        aria-label="Festival list and filters"
      >
        <div className="p-4">
          <h2 className="text-xl font-bold sm:text-2xl">Festival Map</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {festivals.length} festivals mapped
          </p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search festivals..."
            className="mt-4 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/25 focus:outline-none dark:border-border dark:bg-card"
            aria-label="Search festivals"
          />
          <div className="mt-2 flex gap-2">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs dark:border-border dark:bg-card"
            >
              <option value="">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r!}>
                  {formatRegion(r!)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-28 rounded-lg border border-border bg-card px-2 py-1.5 text-xs dark:border-border dark:bg-card"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="TBC">TBC</option>
              <option value="HIATUS">Hiatus</option>
              <option value="DEFUNCT">Defunct</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-muted-foreground">Genres:</span>
            {Object.entries(GENRE_COLORS)
              .slice(0, 8)
              .map(([k, v]) => (
                <span key={k} className="flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: v }}
                  />
                  {k}
                </span>
              ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-border dark:border-border">
          <ul className="divide-y divide-border dark:divide-border" role="list">
            {filtered.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/festivals/${f.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 dark:hover:bg-muted/50"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: genreColor(f.genre) }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{f.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[f.genre, f.region ? formatRegion(f.region) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No festivals match.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
