declare module 'squel' {
  export interface Expression {
    or(condition: string, ...values: any[]): Expression;
  }

  export interface Select {
    from(table: string): Select;
    field(field: string, alias?: string): Select;
    where(condition: string | Expression, ...values: any[]): Select;
    order(field: string, asc?: boolean): Select;
    limit(count: number): Select;
    toParam(): { text: string; values: any[] };
  }

  export function select(): Select;
  export function expr(): Expression;
}
