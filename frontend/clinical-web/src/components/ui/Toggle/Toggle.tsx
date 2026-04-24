import styles from './Toggle.module.scss';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
  id: string;
}

export const Toggle = ({ checked, onChange, label, hint, id }: ToggleProps) => {
  return (
    <label htmlFor={id} className={styles.card}>
      <div>
        <strong>{label}</strong>
        {hint && <p>{hint}</p>}
      </div>

      <span className={`${styles.switch} ${checked ? styles.checked : ''}`} aria-hidden="true">
        <span className={styles.knob} />
      </span>

      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.input}
      />
    </label>
  );
};
