export declare class PaginationModel {
    pageIndex: number;
    page?: number;
    pageSize: number;
    total?: number;
    totalPage?: number;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    static default(): PaginationModel;
    constructor(value?: Partial<PaginationModel>);
}
export interface IPaginationResultModel<T> {
    items: T[];
    pagingData: PaginationModel;
}
