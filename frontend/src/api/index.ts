import type { IEnvironmentRepository } from "./environment/IEnvironmentRepository";
import { MockEnvironmentRepository } from "./environment/MockEnvironmentRepository";
import { SupabaseEnvironmentRepository } from "./environment/SupabaseEnvironmentRepository";
import type { IPhotosRepository } from "./photos/IPhotosRepository";
import { MockPhotosRepository } from "./photos/MockPhotosRepository";
import { SupabasePhotosRepository } from "./photos/SupabasePhotosRepository";
import type { IPlantsRepository } from "./plants/IPlantsRepository";
import { MockPlantsRepository } from "./plants/MockPlantsRepository";
import { SupabasePlantsRepository } from "./plants/SupabasePlantsRepository";

const isMock = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 環境変数 VITE_USE_MOCK に基づき、適切な PlantsRepository の実装を返す。
 * VITE_USE_MOCK の判定はこのファイル内のみで行われ、フックやコンポーネントには一切露出しない。
 */
export function getPlantsRepository(): IPlantsRepository {
  return isMock ? new MockPlantsRepository() : new SupabasePlantsRepository();
}

/**
 * 環境変数 VITE_USE_MOCK に基づき、適切な EnvironmentRepository の実装を返す。
 */
export function getEnvironmentRepository(): IEnvironmentRepository {
  return isMock ? new MockEnvironmentRepository() : new SupabaseEnvironmentRepository();
}

/**
 * 環境変数 VITE_USE_MOCK に基づき、適切な PhotosRepository の実装を返す。
 */
export function getPhotosRepository(): IPhotosRepository {
  return isMock ? new MockPhotosRepository() : new SupabasePhotosRepository();
}
