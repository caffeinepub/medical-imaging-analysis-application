import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Activity, LogOut, Settings } from 'lucide-react';
import type { UserProfile } from '../backend';
import { useState } from 'react';
import ApiConfigDialog from './ApiConfigDialog';
import { useIsCallerAdmin } from '../hooks/useQueries';

interface HeaderProps {
  userProfile: UserProfile | null;
}

export default function Header({ userProfile }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin, isFetched: adminFetched } = useIsCallerAdmin();
  const [showApiConfig, setShowApiConfig] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Only show the admin button once the admin check has fully resolved AND returned true
  const showAdminButton = adminFetched && isAdmin === true;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-medical-primary to-medical-secondary">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">MediScan AI</h1>
              <p className="text-xs text-muted-foreground">Pancreatic Tumor Detection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground">{userProfile.department}</p>
              </div>
            )}
            {showAdminButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiConfig(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">API Config</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {showAdminButton && <ApiConfigDialog open={showApiConfig} onOpenChange={setShowApiConfig} />}
    </>
  );
}
