"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>We’ll be right back.</h1>
      <p>We couldn’t load the latest content. Please try again.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
