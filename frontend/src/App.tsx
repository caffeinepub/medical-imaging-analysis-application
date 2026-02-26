import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginScreen from './components/LoginScreen';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LoginScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ProfileSetup />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show loading while fetching profile
  if (profileLoading || !isFetched) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Main application - at this point userProfile is guaranteed to be UserProfile | null (not undefined)
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header userProfile={userProfile ?? null} />
        <main className="flex-1">
          <Dashboard />
        </main>
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
