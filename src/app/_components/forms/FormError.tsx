type Props = Readonly<{ message?: string }>;

export function FormError({ message }: Props) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-negative/40 bg-negative/10 px-3 py-2 text-sm text-negative"
    >
      {message}
    </p>
  );
}
