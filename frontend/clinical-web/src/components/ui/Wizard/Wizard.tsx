import { Check } from 'lucide-react';
import styles from './Wizard.module.scss';

interface WizardStep {
  id: string;
  label: string;
}

interface WizardProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange?: (stepIndex: number) => void;
  canNavigateToStep?: (stepIndex: number) => boolean;
}

export const Wizard = ({ steps, currentStepIndex, onStepChange, canNavigateToStep }: WizardProps) => {
  return (
    <nav className={styles.wizard} aria-label="Etapas do cadastro">
      <ol>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isAllowed = canNavigateToStep ? canNavigateToStep(index) : true;

          return (
            <li key={step.id} className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}>
              <button
                type="button"
                className={styles.stepButton}
                onClick={() => onStepChange?.(index)}
                disabled={!isAllowed}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={styles.badge} aria-hidden="true">
                  {isCompleted ? <Check size={14} /> : index + 1}
                </span>
                <span className={styles.label}>{step.label}</span>
              </button>
              {index < steps.length - 1 && <span className={styles.line} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
