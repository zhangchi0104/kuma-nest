import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { camelCase } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
type LeafType = string | number | boolean | null | undefined | symbol;
type CamelCased<T> =
  T extends Record<string, any>
    ? {
        [K in keyof T as ToCamelCase<K>]: T[K] extends LeafType
          ? T[K]
          : T[K] extends Array<infer U>
            ? CamelCased<U>[]
            : CamelCased<T[K]>;
      }
    : T;

type ToCamelCase<T> = T extends string
  ? T extends `{${infer H}_${infer R}`
    ? `${Uncapitalize<H>}${Capitalize<ToCamelCase<R>>}`
    : T extends `${infer H}-${infer R}`
      ? `${Uncapitalize<H>}${Capitalize<ToCamelCase<R>>}`
      : Uncapitalize<T>
  : T;

@Injectable()
export class TransformCamcelCaseInterceptor<T>
  implements NestInterceptor<T, CamelCased<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<CamelCased<T>> {
    return next.handle().pipe(map(transofrmObjectkeys));
  }
}

function transofrmObjectkeys<T>(data: T): CamelCased<T> {
  const isObject = typeof data === 'object';
  if (!isObject) {
    return data as CamelCased<T>;
  }
  if (Array.isArray(data)) {
    return data.map((item) => transofrmObjectkeys(item)) as CamelCased<T>;
  }
  const result = Object.create(null);
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    const newKey = camelCase(key);
    result[newKey] = transofrmObjectkeys(val);
  }
  return result as CamelCased<T>;
}
