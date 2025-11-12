import type { z } from "zod";

/**
 * All methods supported by the type system, ExZodOsClient and ExZodOsRouter
 */
export const METHODS = ["get", "post", "put", "delete", "patch"] as const;

/**
 * Union of all methods supported by the type system
 */
export type Method = (typeof METHODS)[number];

/**
 * Type of the API definition
 */
export type Api = Record<string, { [M in Method]?: RouteDescription }>;

/**
 * Type of the description of a single route applicable to any method
 */
type RouteDescription = {
    request: {
        header: z.ZodType | undefined;
        cookie: z.ZodType | undefined;
        path: z.ZodType | undefined;
        query: z.ZodType | undefined;
        body: z.ZodType | undefined;
    };
    response: Record<number | "default", z.ZodType | undefined>;
};

/**
 * Union of all the paths defined in the API definition
 */
export type Path<A extends Api> = keyof A;

/**
 * Union of all methods supported by the given path
 */
export type MethodByPath<A extends Api, P extends Path<A>> = keyof A[P];

/**
 * Union of all paths supported by the given method
 */
export type PathByMethod<A extends Api, M extends Method> = keyof { [P in Path<A> as A[P] extends { [K in M]: unknown } ? P : never]: A[P] };

/**
 * Inputs dictionary needed to make a request to the given endpoint
 */
export type EndpointRequest<A extends Api, M extends MethodByPath<A, P>, P extends Path<A>> = A[P][M] extends { request: infer T }
    ? T
    : never;

/**
 * Responses dictionary of the given endpoint
 */
type EndpointResponse<A extends Api, M extends MethodByPath<A, P>, P extends Path<A>> = A[P][M] extends { response: infer T }
    ? T
    : never;

/**
 * Union of all response codes possible by the given endpoint
 */
export type ResponseCode<A extends Api, M extends MethodByPath<A, P>, P extends Path<A>> = Exclude<keyof EndpointResponse<A, M, P>, "default">;

/**
 * Response body of the given endpoint under a given response code
 */
export type ResponseBody<A extends Api, M extends MethodByPath<A, P>, P extends Path<A>, C extends ResponseCode<A, M, P>> = EndpointResponse<A, M, P>[C] extends z.ZodType ? z.output<EndpointResponse<A, M, P>[C]> : never;

/**
 * Default response body of the given endpoint
 */
export type DefaultResponseBody<A extends Api, M extends MethodByPath<A, P>, P extends Path<A>> = EndpointResponse<A, M, P> extends { default: infer T } ? T extends z.ZodType ? z.output<T> : never : never;