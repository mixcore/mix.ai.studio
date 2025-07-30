import { IBaseAuditedEntity } from "../base/base-audited-entity.model";
import { EMixContentStatus } from "../base/status.type";
export declare const DbContextFixId: {
    All: number;
    MasterDb: number;
};
export declare enum EMixDatabaseProvider {
    SQLSERVER = "SQLSERVER",
    MySQL = "MySQL",
    PostgreSQL = "PostgreSQL",
    SQLITE = "SQLITE"
}
export declare enum EMixDataType {
    String = "String",
    Custom = "Custom",
    DateTime = "DateTime",
    Date = "Date",
    Time = "Time",
    DateTimeLocal = "DateTimeLocal",
    Duration = "Duration",
    PhoneNumber = "PhoneNumber",
    Double = "Double",
    Text = "Text",
    Html = "Html",
    MultilineText = "MultilineText",
    EmailAddress = "EmailAddress",
    Password = "Password",
    Url = "Url",
    ImageUrl = "ImageUrl",
    CreditCard = "CreditCard",
    PostalCode = "PostalCode",
    Upload = "Upload",
    Color = "Color",
    Boolean = "Boolean",
    Icon = "Icon",
    VideoYoutube = "VideoYoutube",
    TuiEditor = "TuiEditor",
    Integer = "Integer",
    Guid = "Guid",
    Reference = "Reference",
    QRCode = "QRCode",
    Tag = "Tag",
    Json = "Json",
    Array = "Array",
    ArrayMedia = "ArrayMedia",
    ArrayRadio = "ArrayRadio",
    Long = "Long"
}
export declare enum MixTableType {
    Service = "Service",
    GuidService = "GuidService"
}
export declare enum EMixRelationShipType {
    OneToMany = "OneToMany",
    ManyToMany = "ManyToMany"
}
export declare enum ENamingConvention {
    SnakeCase = "SnakeCase",
    TitleCase = "TitleCase"
}
export interface IUploadConfiguration {
    arrayAccepts: string[];
    accepts: string;
    isCrop: boolean;
}
export interface IMixColumnConfig {
    isRequire: boolean;
    isEncrypt: boolean;
    upload?: IUploadConfiguration;
    allowedValues?: string[];
}
export interface IMixTableRelationShip {
    parentId: number;
    childId: number;
    displayName: string;
    sourceDatabaseName: string;
    destinateDatabaseName: string;
    type: EMixRelationShipType;
    referenceColumnName: string;
    id: number;
    createdDateTime: string;
    priority: number;
    status: string;
    isDeleted: boolean;
    new: boolean;
}
export declare class MixColumn {
    systemName: string;
    displayName: string;
    mixDatabaseName?: string;
    dataType: EMixDataType;
    mixDatabaseId?: number;
    columnConfigurations: IMixColumnConfig;
    id: number;
    createdDateTime?: string;
    createdBy: string;
    priority: number;
    status: string;
    isValid?: boolean;
    errors?: string[];
    new: boolean;
    constructor(data: Partial<MixColumn>, configuration?: IMixColumnConfig);
}
export declare class MixTable {
    systemName: string;
    type: MixTableType;
    selfManaged: boolean;
    columns: MixColumn[];
    relationships: IMixTableRelationShip[];
    displayName: string;
    mixTenantId: number;
    id: number;
    createdDateTime: string;
    priority: number;
    status: string;
    isValid: boolean;
    errors: string[];
    namingConvention?: ENamingConvention;
    updatePermissions: string[] | undefined;
    readPermissions: string[] | undefined;
    createPermissions: string[] | undefined;
    deletePermissions: string[] | undefined;
    mixDatabaseContextId: number | undefined;
    constructor(value: MixTable);
    static parsePermission(value: string[] | object | undefined): any;
}
export interface MixDatabase extends IBaseAuditedEntity {
    databaseProvider: EMixDatabaseProvider;
    connectionString: string;
    schema: string;
    namingConvention?: ENamingConvention;
    databases?: MixTable[];
    status?: EMixContentStatus;
    displayName: string;
}
