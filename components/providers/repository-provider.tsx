"use client";

import { createContext, useContext, useMemo } from "react";

import { createRepository } from "@/lib/repositories";
import type { Repository } from "@/lib/repositories/types";

const RepositoryContext = createContext<Repository | null>(null);

export function RepositoryProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const repository = useMemo(() => createRepository(), []);
  return (
    <RepositoryContext.Provider value={repository}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const repository = useContext(RepositoryContext);
  if (!repository) {
    throw new Error("RepositoryProvider is missing in the tree.");
  }
  return repository;
}
