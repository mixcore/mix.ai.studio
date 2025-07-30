export declare const DEFAULT_CONFIG: {
    readonly BASE_DOMAIN: "https://api.mixcore.io";
    readonly BASE_API_PATH: "/api/v2";
    readonly TOKEN_TYPE: "Bearer";
    readonly TOKEN_KEY: "mix_access_token";
    readonly REFRESH_TOKEN_KEY: "mix_refresh_token";
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 100;
    readonly REQUEST_TIMEOUT: 30000;
};
export declare const SDK_HEADERS: {
    readonly "x-sdk-name": "Web";
    readonly "x-sdk-platform": "client";
    readonly "x-sdk-language": "web";
    readonly "x-sdk-version": "0.0.1";
};
export declare const ENDPOINTS: {
    readonly auth: {
        readonly signIn: "/rest/auth/user/login";
        readonly externalLogin: "/rest/auth/p4ps/external-login-unsecure";
        readonly register: "/rest/auth/user/register";
        readonly update: "/rest/auth/user/save";
        readonly getProfile: "/rest/auth/user/my-profile";
        readonly culture: "/rest/mix-portal/culture";
        readonly renewToken: "/rest/auth/user/renew-token";
    };
    readonly global: {
        readonly globalSetting: "/rest/shared/get-global-settings";
        readonly dashboardInfo: "/rest/mix-portal/common/en-US/dashboard";
        readonly restartApp: "/rest/shared/stop-application";
        readonly clearCache: "/rest/shared/clear-cache";
    };
    readonly content: {
        readonly pageContent: "/rest/mix-portal/mix-page-content";
        readonly application: "/rest/mix-portal/mix-application";
        readonly postContent: "/rest/mix-portal/mix-post-content";
        readonly moduleContent: "/rest/mix-portal/mix-module-content";
        readonly moduleData: "/rest/mix-portal/mix-module-data";
        readonly postToPost: "/rest/mix-portal/mix-post-post";
        readonly template: "/rest/mix-portal/mix-template";
        readonly database: "/rest/mix-portal/mix-database";
        readonly databaseRelation: "/rest/mix-portal/mix-database-relationship";
        readonly databaseContext: "/rest/mix-portal/mixdb-context";
        readonly getDatabaseBySystemName: "/rest/mix-portal/mix-database/get-by-name";
        readonly mixDb: "/rest/mix-portal/mix-db";
        readonly mixDbColumn: "/rest/mix-portal/mix-database-column";
    };
    readonly storage: {
        readonly upload: "/rest/mix-storage/upload-file";
        readonly uploadBase64: "/rest/mix-storage/upload-file-stream";
        readonly delete: "/rest/mix-storage/delete-file";
    };
    readonly service: {
        readonly metadata: "/rest/mix-services/metadata";
        readonly getMetadata: "/rest/mix-services/metadata/get-metadata";
        readonly createMetadataAsc: "/rest/mix-services/metadata/create-metadata-association";
        readonly deleteMetadataAsc: "/rest/mix-services/metadata/delete-metadata-association";
        readonly sync: "/api/daphale/sync/products";
    };
    readonly settings: {
        readonly config: "/rest/mix-portal/configuration";
    };
    readonly user: {
        readonly list: "/rest/auth/user/list";
        readonly detail: "/rest/auth/user/details";
        readonly register: "/rest/auth/user/register";
        readonly changePassword: "/rest/auth/user/change-password";
        readonly role: "/rest/auth/role";
        readonly permission: "/rest/mix-services/permission";
        readonly delete: "/rest/auth/user/remove-user";
        readonly toggleRole: "/rest/auth/user/user-in-role";
    };
    readonly events: {
        readonly scheduler: "/scheduler";
    };
    readonly log: {
        readonly search: "/rest/mix-log/audit-log/search";
    };
    readonly database: "/rest/mix-portal/mixdb-context";
    readonly table: "/rest/mix-portal/mix-database";
};
