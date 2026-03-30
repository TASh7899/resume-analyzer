import styles from './PopUp.module.css';
import { useEffect } from "react";
import { BiX } from "react-icons/bi"; 

export default function PopUp({ message, onClose, isError }) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const alertTypeClass = isError === true ? styles.errorToast : isError === false ? styles.successToast : styles.defaultToast;

  return (
    <div className={`${styles.popUpOverlay} ${alertTypeClass}`}>
      <div className={styles.popUpBox}>
        <p className={styles.messageText}>{message}</p>

        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <BiX size={24} />
        </button>

      </div>
    </div>
  )
}
