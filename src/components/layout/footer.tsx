import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background transition-colors duration-200">
      <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2 text-center">
          <p className="transition-colors duration-200">
            &copy; {currentYear} Pocket Books. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="transition-colors duration-200">Made with</span>
          <Heart
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-destructive text-destructive animate-pulse"
            aria-label="love"
          />
          <span className="transition-colors duration-200">in India</span>
        </div>
      </div>
    </footer>
  );
}
