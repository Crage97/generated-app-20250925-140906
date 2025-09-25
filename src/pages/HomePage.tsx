import { Mail } from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,hsl(var(--foreground))_0.1px,transparent_0.1px),linear-gradient(to_bottom,hsl(var(--foreground))_0.1px,transparent_0.1px)]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--primary)/0.1),transparent)]"></div>
        </div>
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Mail className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                MomentumMail
              </span>
            </a>
            <Button variant="outline" className="transition-all duration-200 ease-in-out active:scale-95 hover:bg-primary/10">
              Connect Account
            </Button>
          </nav>
        </header>
        <Dashboard />
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MomentumMail. Built with ❤️ at Cloudflare.</p>
        </footer>
      </div>
    </div>
  );
}