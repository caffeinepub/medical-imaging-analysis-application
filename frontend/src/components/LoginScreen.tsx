import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Activity, Loader2, Shield, Zap, Brain } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-medical-primary/5">
      <div className="container flex flex-1 flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-medical-primary to-medical-secondary shadow-lg">
              <Activity className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">MediScan AI</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Advanced Pancreatic Tumor Detection System
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-medical-primary/10">
                <Brain className="h-5 w-5 text-medical-primary" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">AI-Powered Analysis</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Advanced machine learning for accurate tumor detection
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-medical-secondary/10">
                <Zap className="h-5 w-5 text-medical-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">Fast Results</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get comprehensive analysis results in seconds
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-medical-accent/10">
                <Shield className="h-5 w-5 text-medical-accent" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground">Secure & Private</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  End-to-end encrypted storage on the Internet Computer
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full bg-gradient-to-r from-medical-primary to-medical-secondary hover:opacity-90"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Login to Continue'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure authentication powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}
