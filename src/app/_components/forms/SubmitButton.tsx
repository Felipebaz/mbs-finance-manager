"use client";

import { useFormStatus } from "react-dom";

type Props = Readonly<{
  label?: string;
  pendingLabel?: string;
  className?: string;
}>;

export function SubmitButton({
  label = "Save",
  pendingLabel = "Saving…",
  className,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={[
        "inline-flex items-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50",
        className ?? "",
      ].join(" ")}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
