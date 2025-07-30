export declare class MixcoreSDKError extends Error {
    code?: string | undefined;
    statusCode?: number | undefined;
    constructor(message: string, code?: string | undefined, statusCode?: number | undefined);
}
export declare class AuthenticationError extends MixcoreSDKError {
    constructor(message?: string);
}
export declare class NetworkError extends MixcoreSDKError {
    constructor(message?: string);
}
export declare class ValidationError extends MixcoreSDKError {
    constructor(message?: string);
}
