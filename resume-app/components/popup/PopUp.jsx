import styles from './PopUp.module.css';

export default function PopUp({ message, onClose, isError }) {
  return (
    <div className={styles.popUpOverlay}>
      <div className={styles.popUpBox}>
        <p className={isError === true ? styles.error : isError === false ? styles.success : ''} >{message}</p>
        <div className={styles.buttonDiv}>
          <button onClick={onClose}>close</button>
        </div>
      </div>
    </div>
  )
}
