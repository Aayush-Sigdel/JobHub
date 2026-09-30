import { cn } from "@/lib/utils";
import styles from "./water-loading-screen.module.css";

interface WaterLoadingScreenProps {
  label?: string;
  className?: string;
  /** Use inside an existing page shell, which already includes navigation. */
  contained?: boolean;
}

export function WaterLoadingScreen({
  label = "Loading",
  className,
  contained = false,
}: WaterLoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(styles.screen, contained && styles.contained, className)}
    >
      <span className="sr-only">{label}</span>
      <div className={styles.orb} aria-hidden="true">
        <div className={styles.water}>
          <div className={styles.waveBack} />
          <div className={styles.waveFront} />
        </div>
      </div>
    </div>
  );
}
