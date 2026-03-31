import { useEffect, useRef } from 'react';
import styles from './AdModal.module.css';

type Props = {
  onComplete: () => void;
};

export default function AdModal({ onComplete }: Props) {
  const adLoaded = useRef(false);

  useEffect(() => {
    // Prevent double-pushing in React Strict Mode
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Support Our Tool</h2>
        <p>Please view this message from our sponsors to keep this tool free.</p>
        
        <div className={styles.adContainer} style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <ins 
            className="adsbygoogle"
            style={{ display: "block", minHeight: "250px", width: "100%" }}
            data-ad-client="ca-pub-5451459449295672"
            data-ad-slot="8127864116"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>

        {/* Button is now instantly clickable with no disabled state */}
        <button 
          className={styles.continueBtn}
          onClick={onComplete}
        >
          Continue to Resume Builder
        </button>
      </div>
    </div>
  );
}
