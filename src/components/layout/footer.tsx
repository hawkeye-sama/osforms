import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-border/40 bg-card/20 border-t px-8 py-16 backdrop-blur-sm">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-4">
        <div>
          <div className="text-base font-semibold text-white">OSForms</div>
          <p className="text-muted-foreground mt-3 text-sm">
            Built by a dev,
            <br />
            for developers.
          </p>
        </div>

        <div>
          <div className="text-foreground mb-3 text-sm font-semibold">
            Product
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="https://github.com/hawkeye-sama/osforms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="/changelog"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Changelog
            </Link>
          </nav>
        </div>

        <div>
          <div className="text-foreground mb-3 text-sm font-semibold">
            Resources
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Support
            </Link>
          </nav>
        </div>

        <div>
          <div className="text-foreground mb-3 text-sm font-semibold">
            Legal
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-border/40 mx-auto mt-12 max-w-5xl border-t pt-8 text-center">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} OSForms. Open source, MIT License.
        </p>
      </div>
    </footer>
  );
}
