import { ICulture } from "./culture.type";
export interface IRole {
    roleId: string;
    userId: string;
}
export interface IProfile {
    joinDate: Date;
    isActived: false;
    lastModified?: Date;
    modifiedBy: string;
    registerType?: string;
    avatar?: string;
    name?: string;
    nickName?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    countryId?: number;
    culture?: ICulture;
    dob?: string;
    roles?: IRole[];
    claims?: string[];
    logins?: string[];
    id: string;
    userName: string;
    normalizedUserName?: string;
    email: string;
    normalizedEmail?: string;
    emailConfirmed: boolean;
    passwordHash: string;
    securityStamp: string;
    concurrencyStamp: string;
    phoneNumber?: string;
    phoneNumberConfirmed: boolean;
    contactNumber?: string;
    twoFactorEnabled: boolean;
    fullname?: string;
    birthDate?: Date;
    userData?: Record<string, string>;
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
}
export interface IUser {
    id: string;
    userName: string;
    email: string;
    createdDateTime: string;
    isActived: boolean;
    userData: IUserData;
    roles: IRole[];
    endpoints: any[];
    isChangePassword: boolean;
}
export interface IUserData {
    Id: number;
    CreatedDateTime: string;
    LastModified: any;
    MixTenantId: number;
    CreatedBy: any;
    ModifiedBy: any;
    Priority: number;
    Status: string;
    IsDeleted: boolean;
    ParentId: string;
    ParentType: string;
    PhoneNumber: string;
    FullName: string;
    Email: string;
    DateOfBirth: string;
    Username: string;
    Avatar: string;
}
export interface IRegisterResult {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    expiresIn: number;
    issued: string;
    expires: string;
    isActive: boolean;
    emailConfirmed: boolean;
    info: IRegisterResultInfo;
}
export interface IRegisterResultInfo {
    parentId: string;
    parentType: string;
    username: string;
    email: string;
    phoneNumber: any;
}
