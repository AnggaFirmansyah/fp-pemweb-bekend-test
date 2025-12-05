/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Request } from 'express';
import { type ParamsDictionary } from 'express-serve-static-core';
import { type ParsedQs } from 'qs';

import { type IJwtPayload } from './jwt.type';

export interface AuthedRequest<
  P = ParamsDictionary,
  ResBody = any,
  RequestBody = any,
  RequestQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, RequestBody, RequestQuery, Locals> {
  user?: IJwtPayload;
}
