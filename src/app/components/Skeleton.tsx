import React from "react";

export const Skeleton = ({
  className = "h-4 w-full rounded",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={`bg-white/5 animate-pulse ${className}`}>{children}</div>
  );
};
