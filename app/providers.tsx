"use client";

import { Toaster } from "sonner";

import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { RepositoryProvider } from "@/components/providers/repository-provider";
import { ServiceWorkerRegistrar } from "@/components/providers/service-worker-registrar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <ServiceWorkerRegistrar />
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "border border-border bg-card text-card-foreground shadow-card",
                description: "text-muted-foreground",
                actionButton: "bg-primary text-primary-foreground",
                cancelButton: "bg-secondary text-secondary-foreground"
              }
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </RepositoryProvider>
  );
}
