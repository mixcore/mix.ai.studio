export class PaginationModel {
    pageIndex: number = 0;
    page?: number;
    pageSize: number = 10;
    total?: number;
    totalPage?: number;
}

export interface PaginationResult<T> {
    items: T[];
    pageIndex: number;
    pageSize: number;
    total: number;
    totalPage: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}


export interface PageContent {
  id?: number;
  type?: string;
  detailUrl?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  layoutId?: number;
  templateId?: number;
  image?: string;
  seoName?: string;
  seoTitle?: string;
  tenantId?: number;
  isPublic?: boolean;
  specificulture?: string;
  parentId?: number;
  mixCultureId?: number;
  createdDateTime?: string;
  lastModified?: string;
  createdBy?: string;
  modifiedBy?: string;
  priority?: number;
  status?: string;
  isDeleted?: boolean;
}