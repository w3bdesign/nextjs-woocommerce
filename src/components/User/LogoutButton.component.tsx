import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/utils/auth';
import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  onLogoutSuccess?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  showIcon?: boolean;
  className?: string;
  asChild?: boolean;
}

/**
 * Reusable logout button component with confirmation dialog
 * @function LogoutButton
 * @param {function} onLogoutSuccess - Optional callback to run before redirect (e.g., update parent state)
 * @param {string} variant - Button variant
 * @param {boolean} showIcon - Whether to show logout icon
 * @param {string} className - Additional CSS classes
 * @param {boolean} asChild - Whether to render as child element (for dropdown items)
 * @returns {JSX.Element} - Rendered logout button with confirmation dialog
 */
const LogoutButton = ({
  onLogoutSuccess,
  variant = 'ghost',
  showIcon = true,
  className = '',
  asChild = false,
}: LogoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(() => {
        // Show toast notification
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out of your account.',
        });

        // Call parent callback if provided (e.g., to update auth state)
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>
        <Button variant={variant} disabled={loading} className={className}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              {showIcon && <LogOut className="mr-2 h-4 w-4" />}
              Logout
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You will need to log in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              'Logout'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
