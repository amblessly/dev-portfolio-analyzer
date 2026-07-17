"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          background: "#0b0f17",
          color: "#e5e7eb",
          margin: 0,
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Something went wrong</h2>
        <p style={{ opacity: 0.7, maxWidth: "32rem" }}>
          A server-side error occurred. Check the Vercel Function Logs for details.
        </p>
        {error?.digest && (
          <code style={{ fontSize: "0.8rem", opacity: 0.5 }}>Digest: {error.digest}</code>
        )}
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #334155",
            background: "#1e293b",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
