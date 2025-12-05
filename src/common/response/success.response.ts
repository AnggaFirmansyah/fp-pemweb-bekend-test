/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type IPaginationMeta } from '../interface';

export class SuccessResponse {
  constructor(
    statusCode: number,
    message: string,
    data?: any,
    meta?: IPaginationMeta,
  ) {
    this.statusCode = statusCode;
    this.message = message;

    if (data !== undefined) this.data = data;
    if (meta !== undefined) this.meta = meta;
  }

  statusCode: number;
  message: string;
  data?: any;
  meta?: IPaginationMeta | undefined;

  json() {
    return {
      success: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data || undefined,
      meta: this.meta || undefined,
    };
  }
}
