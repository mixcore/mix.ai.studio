import { BaseRestService } from './base-rest-service';
import { AuthService } from './auth.service';
import type { PageContent } from '$lib/models';

export class PageService extends BaseRestService<PageContent> {
  constructor(authService: AuthService) {
    // Use the model name as in the constants: "/rest/mix-portal/mix-page-content"
    super('api/v2/rest/mix-portal/mix-page-content',  authService);
  }
  async getBySeoName(seoName: string | number, queryParams: Record<string, any> = {}): Promise<PageContent> {
    const url = this.buildUrl(`${this.endpoint}/get-by-seo-name/${seoName}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

}
