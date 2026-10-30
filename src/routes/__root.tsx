import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  const router = useRouter();

  useEffect(() => {
    // If an unknown path or static suffix (like index.html) is loaded, redirect to home
    if (typeof window !== "undefined") {
      router.navigate({ to: "/" });
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(
    "[APP_BOOT_ERROR] Router rendered ErrorComponent: This page didn't load",
    error?.message || String(error),
  );
  console.error("[APP_PAGE_ERROR] This page didn't load:", error?.message || String(error));
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleResetAppState = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = "/";
      }
    } catch (_e) {
      window.location.reload();
    }
  };

  const errorMessage = error?.message || String(error);
  const errorStack = error?.stack || "";

  return (
    <div
      data-testid="router-error-component"
      className="flex min-h-screen items-center justify-center bg-background px-4 py-8"
    >
      <div className="max-w-md w-full text-center">
        <h1
          data-testid="router-error-title"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          This page didn't load
        </h1>
        <p data-testid="router-error-description" className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>

        {errorMessage && (
          <div
            data-testid="router-error-details"
            className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-left text-xs font-mono text-destructive break-words max-h-48 overflow-y-auto"
          >
            <p className="font-semibold">{errorMessage}</p>
            {errorStack && (
              <details className="mt-2 text-[11px] text-muted-foreground">
                <summary className="cursor-pointer hover:underline">Stack trace</summary>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-[10px] opacity-80 overflow-x-auto">
                  {errorStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            data-testid="router-error-retry-button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            data-testid="router-error-home-link"
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
          <button
            type="button"
            data-testid="router-error-reset-app-button"
            onClick={handleResetAppState}
            className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
            title="Clear saved local settings and restart from scratch"
          >
            Reset App Data
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
