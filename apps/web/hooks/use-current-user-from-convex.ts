import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Hook to get the current authenticated user from the users table.
 *
 * @returns Object with user data, loading state, and authentication status
 *
 * @example
 * ```tsx
 * const { user, isLoading, isAuthenticated } = useCurrentUser();
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */
export function useCurrentUser() {
  const user = useQuery(api.users.getCurrentUser);

  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: user !== null && user !== undefined,
  };
}
