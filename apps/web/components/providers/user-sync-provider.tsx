"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Component that ensures the authenticated user exists in the Convex users table.
 * This should be mounted once in the app layout, inside the ConvexProvider + ClerkProvider.
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Call syncUser to ensure user exists in DB
      syncUser().catch((err) => {
        console.error("Failed to sync user:", err);
      });
    }
  }, [isLoaded, isSignedIn, syncUser]);

  return <>{children}</>;
}
