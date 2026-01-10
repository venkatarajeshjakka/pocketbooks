import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            &copy; {currentYear} Pocket Books Studio
          </p>
          <p className="text-[10px] font-medium text-muted-foreground/40">
            Intelligent Business Management System
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-accent/30 px-3 py-1.5 transition-all hover:bg-accent/50">
            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/70">Made with</span>
            <Heart
              className="h-3.5 w-3.5 fill-destructive text-destructive animate-[pulse_1.5s_ease-in-out_infinite]"
              aria-label="love"
            />
            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/70">in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
