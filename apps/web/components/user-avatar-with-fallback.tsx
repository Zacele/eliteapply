"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user-from-convex";

const avatarVariants = cva(
  "inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface UserAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {}

/**
 * User avatar component that displays the current user's image or initials.
 * Reads data from the Convex users table via useCurrentUser hook.
 *
 * @example
 * ```tsx
 * <UserAvatar size="lg" />
 * <UserAvatar size="sm" className="border-2" />
 * ```
 */
export function UserAvatar({ className, size, ...props }: UserAvatarProps) {
  const { user, isLoading } = useCurrentUser();

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(avatarVariants({ size, className }), "animate-pulse")}
        {...props}
      />
    );
  }

  // Not authenticated or no user data
  if (!user) {
    return (
      <div className={cn(avatarVariants({ size, className }))} {...props}>
        ?
      </div>
    );
  }

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  const initials = getInitials(user.name);

  // Show image if available
  if (user.imageUrl) {
    return (
      <div className={cn(avatarVariants({ size, className }))} {...props}>
        <img
          src={user.imageUrl}
          alt={user.name || "User avatar"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Fallback to initials with color based on first letter
  const colorClasses = [
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200",
  ];

  const colorIndex = (user.name?.charCodeAt(0) || 0) % colorClasses.length;

  return (
    <div
      className={cn(avatarVariants({ size }), colorClasses[colorIndex], className)}
      {...props}
    >
      {initials}
    </div>
  );
}
