"use client";
import { CSSProperties, useRef, useState } from "react";
import Spinner from "../Spinner/Spinner";
import styles from "./button.module.css";
import clsx from "clsx";

interface IButtonProps {
  btnStyle?: "success" | "primary" | "danger" | "warning" | "info";
  type?: "button" | "submit" | "reset";
  text?: string;
  onClick?: () => void;
  loading?: boolean;
  additionalStyles?: CSSProperties;
}

export default function Button({ 
    btnStyle = "primary",
    type = "button", 
    text, 
    onClick, 
    loading = false,
    additionalStyles = {} 
  }: IButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [spinnerSize, setSpinnerSize] = useState<number>(0);

  const onBtnClickHandler = () => {
    if (btnRef.current) {
      const computedStyle = getComputedStyle(btnRef.current);
      const size = Math.ceil(parseFloat(computedStyle.fontSize));
      setSpinnerSize(size);
    }

    if (onClick) onClick();
  }

  return (
    <button
      ref={btnRef}
      className={clsx(styles.btn, styles[btnStyle])}
      type={type}
      onClick={onBtnClickHandler}
      disabled={loading}
      style={additionalStyles}
    >
      {loading ? <Spinner size={spinnerSize} additionalStyles={{margin: "auto"}} /> : text}
    </button>
  );
}
