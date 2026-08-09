import styles from "./Button.module.scss";

type ButtonProps = {
  label: string;
  type?: "button" | "submit";
};

const Button = ({ label, type = "button" }: ButtonProps) => (
  <button className={styles.button} type={type}>
    {label}
  </button>
);

export default Button;
