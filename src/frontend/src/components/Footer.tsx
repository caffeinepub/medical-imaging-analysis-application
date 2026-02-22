import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            © 2025. Built with <Heart className="h-4 w-4 fill-medical-primary text-medical-primary" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-medical-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs">
            Medical imaging analysis powered by AI • For research and educational purposes
          </p>
        </div>
      </div>
    </footer>
  );
}
