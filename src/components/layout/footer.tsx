import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {currentYear} Pocket Books
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3 w-3 fill-destructive text-destructive" aria-label="love" />
          <span>in India</span>
        </div>
      </div>
    </footer>
  );
}
