"use client";

import { useEffect, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  // When the image fails to load, we render this node instead. Pass null
  // to render nothing (the parent layout collapses around the gap — good
  // for gallery grids where we'd rather drop a dead tile than show a
  // broken-image icon).
  fallback?: React.ReactNode;
  // Optional secondary src tried before giving up. Use to substitute a
  // local SVG placeholder when a scraped third-party URL fails — keeps the
  // template visually populated instead of leaving holes.
  defaultSrc?: string;
};

// Renders an <img> that swallows load errors. Scraped third-party photos
// frequently return 403/404 (hotlink blocks, expired signed URLs, deleted
// CDN assets). On error we try defaultSrc once, then fall through to the
// fallback node.
export function SafeImg({ src, fallback = null, defaultSrc, alt = "", ...rest }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setBroken(false);
  }, [src]);

  if (broken) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (defaultSrc && currentSrc !== defaultSrc) {
          setCurrentSrc(defaultSrc);
        } else {
          setBroken(true);
        }
      }}
      {...rest}
    />
  );
}
