import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({ children, variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-brand-600 text-white hover:bg-brand-700": variant === "primary",
          "border border-line bg-white text-ink hover:bg-canvas": variant === "secondary",
          "text-muted hover:bg-canvas hover:text-ink": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
