"use client";

type ConfirmDeleteButtonProps = {
  label: string;
  confirmMessage: string;
  className?: string;
};

export function ConfirmDeleteButton({
  label,
  confirmMessage,
  className,
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
