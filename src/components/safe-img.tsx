"use client";

import { useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  // When the image fails to load, we render this node instead. Pass null
  // to render nothing (the parent layout collapses around the gap — good
  // for gallery grids where we'd rather drop a dead tile than show a
  // broken-image icon).
  fallback?: React.ReactNode;
};

// Renders an <img> that swallows load errors. Scraped third-party photos
// frequently return 403/404 (hotlink blocks, expired signed URLs, deleted
// CDN assets). Rather than let the browser show a broken-image icon on a
// prospect's preview, we render a transparent fallback and move on.
export function SafeImg({ src, fallback = null, alt = "", ...rest }: Props) {
  const [broken, setBroken] = useState(false);
  if (broken) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setBroken(true)} {...rest} />;
}
