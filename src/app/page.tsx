export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-block rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        Personal finance
      </span>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Moneta
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Your personal finance, in focus.
      </p>
      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
        Coming soon.
      </p>
    </main>
  );
}
