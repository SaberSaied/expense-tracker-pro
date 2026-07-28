/**
 * Frontend API client services and HTTP integration wrappers.
 */
export { api, ApiError, tokenStorage } from "./api";
export { authApi } from "./auth";
export { categoriesApi } from "./categories";
export type { User, AuthTokens, AuthResponse, LoginInput, RegisterInput } from "./auth";
export type { ApiCategory, CreateCategoryInput, UpdateCategoryInput } from "./categories";
