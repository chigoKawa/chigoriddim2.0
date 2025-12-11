"use client";

import React from "react";
import { APP_NAME } from "../constants";

export default function AppPage() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Schema and rendering examples for using Pexels images stored as JSON
          in Contentful.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">JSON schema: PexelsImage</h2>
        <p className="text-sm text-muted-foreground">
          Store a single Pexels photo in a JSON field using the following
          TypeScript interface. The field editor in this app will write data in
          this shape.
        </p>
        <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
          <code>{`export interface PexelsImage {
  provider: 'pexels';
  photoId: number;
  url: string;
  width: number;
  height: number;
  alt?: string;
  avgColor?: string;

  src: {
    original: string;
    large?: string;
    large2x?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };

  photographer: {
    id: number;
    name: string;
    url: string;
  };

  attribution: {
    text: string;
    url: string;
  };

  meta?: {
    selectedAt?: string;
    locale?: string;
    source?: 'search' | 'curated' | 'other';
  };

  display?: {
    preferredVariant?: keyof PexelsImage['src'];
    focalUsage?: 'thumbnail' | 'card' | 'hero' | 'background';
  };
}`}</code>
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">React rendering example</h2>
        <p className="text-sm text-muted-foreground">
          Example React component that renders a <code>PexelsImage</code> with a
          sensible default variant and attribution.
        </p>
        <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
          <code>{`type PexelsImage = /* as above */;

interface Props {
  image: PexelsImage | null;
  className?: string;
}

export function PexelsImageComponent({ image, className }: Props) {
  if (!image) return null;

  const variant =
    image.display?.preferredVariant && image.src[image.display.preferredVariant]
      ? image.display.preferredVariant
      : ('landscape' in image.src ? 'landscape' : 'medium');

  const src = image.src[variant];

  return (
    <figure className={className}>
      <img
        src={src}
        alt={image.alt || image.attribution?.text || ''}
        style={{ backgroundColor: image.avgColor || 'transparent' }}
        loading="lazy"
      />
      {image.attribution && (
        <figcaption style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          <a href={image.attribution.url} target="_blank" rel="noreferrer">
            {image.attribution.text}
          </a>
        </figcaption>
      )}
    </figure>
  );
}`}</code>
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          Laravel / Blade rendering example
        </h2>
        <p className="text-sm text-muted-foreground">
          Example Blade snippet for rendering the same JSON structure in a
          Laravel app.
        </p>
        <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
          <code>{`@php
  /** @var array|null $image */
  if (!$image) return;
  $variant = $image['display']['preferredVariant'] ?? 'landscape';
  $src = $image['src'][$variant] ?? $image['src']['medium'] ?? null;
@endphp

@if($src)
  <figure class="pexels-image">
    <img
      src="{{ $src }}"
      alt="{{ $image['alt'] ?? $image['attribution']['text'] ?? '' }}"
      style="background-color: {{ $image['avgColor'] ?? 'transparent' }};"
      loading="lazy"
    />
    @if(!empty($image['attribution']))
      <figcaption>
        <a href="{{ $image['attribution']['url'] }}" target="_blank" rel="noreferrer">
          {{ $image['attribution']['text'] }}
        </a>
      </figcaption>
    @endif
  </figure>
@endif`}</code>
        </pre>
      </section>
    </div>
  );
}
