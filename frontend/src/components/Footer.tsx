export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MediScan AI. All rights reserved.</p>
          <p className="text-xs">
            Medical imaging analysis powered by AI • For research and educational purposes only
          </p>
        </div>
      </div>
    </footer>
  );
}
