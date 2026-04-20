import { appConfig, isSupabaseConfigured } from "@/lib/config";
import { createDemoRepository } from "@/lib/repositories/demo-repository";
import { createSupabaseRepository } from "@/lib/repositories/supabase-repository";
import type { Repository } from "@/lib/repositories/types";

let repository: Repository | null = null;

export function createRepository(): Repository {
  if (repository) return repository;
  repository = isSupabaseConfigured
    ? createSupabaseRepository(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
    : createDemoRepository();
  return repository;
}
