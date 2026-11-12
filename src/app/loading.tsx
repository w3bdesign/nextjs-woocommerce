import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

/**
 * Shown while a route segment is loading (replaces the NProgress bar from pages/_app.tsx).
 */
export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <LoadingSpinner />
    </div>
  );
}
