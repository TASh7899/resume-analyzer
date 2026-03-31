import { useEffect, useRef } from 'react';

export default function AdUnit({ slotId, style }: { slotId: string, style?: React.CSSProperties }) {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;
    try {
      if (typeof window !== "undefined") {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adLoaded.current = true;
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden', ...style }}>
      <ins 
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-5451459449295672"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true">
      </ins>
    </div>
  );
}
