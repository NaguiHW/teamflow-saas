import styles from "./Button.module.scss";

type ButtonProps = {
  label: string;
  type?: "button" | "submit";
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
};

const Button = ({
  label,
  type = "button",
  disabled = false,
  isLoading = false,
  onClick,
}: ButtonProps) => (
  <button
    className={styles.button}
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    onClick={onClick}
  >
    {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    {label}
  </button>
);

export default Button;
