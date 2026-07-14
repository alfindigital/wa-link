import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex w-full flex-nowrap items-center justify-center gap-1 px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <span className="whitespace-nowrap text-[10px] text-muted-foreground">
        by <span className="font-medium text-foreground">@alfindigital</span>
      </span>
      <span className="text-[10px] text-muted-foreground">·</span>
      <Link
        to="/privasi"
        className="whitespace-nowrap rounded-md px-1 py-0.5 text-[10px] text-muted-foreground hover:text-primary"
      >
        Privasi
      </Link>
      <span className="text-[10px] text-muted-foreground">·</span>
      <a
        href="https://alfindigital.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Website alfindigital.com"
        title="alfindigital.com"
        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
      >
        <Globe className="h-3 w-3" aria-hidden="true" />
      </a>
      <a
        href="https://x.com/alfindigital"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter) @alfindigital"
        title="X @alfindigital"
        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
        </svg>
      </a>
      <a
        href="https://t.me/alfindigitalcom"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram @alfindigitalcom"
        title="Telegram @alfindigitalcom"
        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M21.94 4.34 18.7 19.62c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.61-.2L6.22 12.95l-4.86-1.52c-1.06-.33-1.08-1.06.22-1.57l19-7.32c.88-.33 1.65.2 1.36 1.8Z" />
        </svg>
      </a>
    </footer>
  );
}