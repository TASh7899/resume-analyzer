import { useState, useEffect, useRef } from 'react';
import styles from './AdModal.module.css';

type Props = {
  onComplete: () => void;
};

export default function AdModal({ onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(15);
  const adLoaded = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Support Our Tool</h2>
        <p>Your resume builder is loading. Please view this message from our sponsors to keep this tool free.</p>
        
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

        <button 
          className={styles.continueBtn}
          disabled={timeLeft > 0} 
          onClick={onComplete}
        >
          {timeLeft > 0 ? `Continue to App in ${timeLeft}s` : "Continue to Resume Builder"}
        </button>
      </div>
    </div>
  );
}
