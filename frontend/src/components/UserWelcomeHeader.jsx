import React from "react";

export function UserWelcomeHeader({ user }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-primary tracking-tight">Welcome, {user?.firstName || "Student"}!</h1>
        <p className="text-muted-foreground font-medium text-lg">Manage your marketplace activity and campus life</p>
      </div>
    </div>
  );
}

