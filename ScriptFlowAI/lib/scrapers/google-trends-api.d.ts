declare module 'google-trends-api' {
  export function interestOverTime(options: {
    keyword: string;
    geo?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<string>;

  export function relatedQueries(options: {
    keyword: string;
    geo?: string;
  }): Promise<string>;
}
