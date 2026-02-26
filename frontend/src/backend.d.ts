import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExternalApiConfig {
    endpointUrl: string;
    apiKey: string;
}
export type ScanId = bigint;
export interface TumorDetectionResult {
    probability: number;
    tumorFound: boolean;
    maskImage: Uint8Array;
    stage: TumorStage;
    confidence: number;
}
export interface CTScan {
    id: ScanId;
    analysisResult?: TumorDetectionResult;
    patientId: PatientId;
    scanImage: Uint8Array;
}
export type PatientId = string;
export interface UserProfile {
    name: string;
    specialization: string;
    department: string;
}
export enum TumorStage {
    stage0 = "stage0",
    stage1 = "stage1",
    stage2 = "stage2",
    stage3 = "stage3",
    stage4 = "stage4"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    analyzeScan(scanId: ScanId): Promise<ScanId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    configureExternalApi(config: ExternalApiConfig): Promise<void>;
    getAllScans(): Promise<Array<CTScan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExternalApiConfig(): Promise<ExternalApiConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVersion(): Promise<string>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    readScan(scanId: ScanId): Promise<CTScan>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadScan(patientId: PatientId, scanBlob: Uint8Array): Promise<ScanId>;
}
