import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-2">
          <p>&copy; {currentYear} Pocket Books. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart className="h-4 w-4 fill-red-500 text-red-500 animate-pulse" />
          <span>in India</span>
        </div>
      </div>
    </footer>
  );
}
