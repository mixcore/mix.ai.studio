// MixQuery Builder - Type-safe query builder for Mixcore API

export interface WhereCondition {
  column: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

export interface OrderByCondition {
  column: string;
  direction: 'asc' | 'desc';
}

export class MixQuery {
  private conditions: WhereCondition[] = [];
  private orderConditions: OrderByCondition[] = [];
  private selectFields: string[] = [];
  private limitValue?: number;
  private skipValue?: number;

  // Where conditions
  where(column: string, operator: string | any, value?: any): this {
    if (arguments.length === 2) {
      // where(column, value) - assumes '=' operator
      this.conditions.push({
        column,
        operator: '=',
        value: operator,
        logic: 'AND'
      });
    } else {
      // where(column, operator, value)
      this.conditions.push({
        column,
        operator,
        value,
        logic: 'AND'
      });
    }
    return this;
  }

  orWhere(column: string, operator: string | any, value?: any): this {
    if (arguments.length === 2) {
      this.conditions.push({
        column,
        operator: '=',
        value: operator,
        logic: 'OR'
      });
    } else {
      this.conditions.push({
        column,
        operator,
        value,
        logic: 'OR'
      });
    }
    return this;
  }

  // Convenience methods for common operators
  whereEquals(column: string, value: any): this {
    return this.where(column, '=', value);
  }

  whereNotEquals(column: string, value: any): this {
    return this.where(column, '!=', value);
  }

  whereGreaterThan(column: string, value: any): this {
    return this.where(column, '>', value);
  }

  whereGreaterThanOrEqual(column: string, value: any): this {
    return this.where(column, '>=', value);
  }

  whereLessThan(column: string, value: any): this {
    return this.where(column, '<', value);
  }

  whereLessThanOrEqual(column: string, value: any): this {
    return this.where(column, '<=', value);
  }

  whereLike(column: string, value: string): this {
    return this.where(column, 'LIKE', value);
  }

  whereIn(column: string, values: any[]): this {
    return this.where(column, 'IN', values);
  }

  whereNotIn(column: string, values: any[]): this {
    return this.where(column, 'NOT IN', values);
  }

  whereNull(column: string): this {
    return this.where(column, 'IS NULL', null);
  }

  whereNotNull(column: string): this {
    return this.where(column, 'IS NOT NULL', null);
  }

  // Ordering
  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderConditions.push({ column, direction });
    return this;
  }

  orderByAsc(column: string): this {
    return this.orderBy(column, 'asc');
  }

  orderByDesc(column: string): this {
    return this.orderBy(column, 'desc');
  }

  // Selection
  select(...fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  // Pagination
  take(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  limit(limit: number): this {
    return this.take(limit);
  }

  skip(offset: number): this {
    this.skipValue = offset;
    return this;
  }

  offset(offset: number): this {
    return this.skip(offset);
  }

  // Pagination helpers
  page(pageNumber: number, pageSize: number): this {
    this.limitValue = pageSize;
    this.skipValue = (pageNumber - 1) * pageSize;
    return this;
  }

  // Build methods
  toQueryParams(): Record<string, any> {
    const params: Record<string, any> = {};

    // Where conditions
    if (this.conditions.length > 0) {
      params.where = this.conditions;
    }

    // Order by
    if (this.orderConditions.length > 0) {
      params.orderBy = this.orderConditions;
    }

    // Select fields
    if (this.selectFields.length > 0) {
      params.select = this.selectFields;
    }

    // Pagination
    if (this.limitValue !== undefined) {
      params.take = this.limitValue;
    }

    if (this.skipValue !== undefined) {
      params.skip = this.skipValue;
    }

    return params;
  }

  toSqlWhere(): string {
    if (this.conditions.length === 0) return '';

    const parts: string[] = [];

    for (let i = 0; i < this.conditions.length; i++) {
      const condition = this.conditions[i];
      
      if (i > 0) {
        parts.push(condition.logic || 'AND');
      }

      if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const values = Array.isArray(condition.value) 
          ? condition.value.map(v => `'${v}'`).join(',')
          : `'${condition.value}'`;
        parts.push(`${condition.column} ${condition.operator} (${values})`);
      } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        parts.push(`${condition.column} ${condition.operator}`);
      } else {
        parts.push(`${condition.column} ${condition.operator} '${condition.value}'`);
      }
    }

    return parts.join(' ');
  }

  // Clone method for immutability
  clone(): MixQuery {
    const newQuery = new MixQuery();
    newQuery.conditions = [...this.conditions];
    newQuery.orderConditions = [...this.orderConditions];
    newQuery.selectFields = [...this.selectFields];
    newQuery.limitValue = this.limitValue;
    newQuery.skipValue = this.skipValue;
    return newQuery;
  }

  // Reset method
  reset(): this {
    this.conditions = [];
    this.orderConditions = [];
    this.selectFields = [];
    this.limitValue = undefined;
    this.skipValue = undefined;
    return this;
  }

  // Debugging
  toString(): string {
    return JSON.stringify(this.toQueryParams(), null, 2);
  }
}