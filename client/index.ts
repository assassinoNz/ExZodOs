import * as axios from "axios";
import type { Api, ResponseCode, MethodByPath, Path, PathByMethod, ResponseBody, DefaultResponseBody, Method } from "../core/index.ts";
import type { ConfigParam } from "../core/client.ts";
import qs from "qs";

export { axios };

/**
 * Api aware type-safe wrapper around Axios
 */
export class ExZodOsClient<A extends Api> {
    public readonly axios: axios.AxiosInstance;

    constructor(baseURL: string) {
        this.axios = axios.default.create({ baseURL });
    }

    async get<P extends PathByMethod<A, "get">>(path: P, ...[config]: ConfigParam<A, "get", P>) {
        const axiosConfig = ExZodOsClient.buildAxiosConfig("get", path as string, config);
        const res = await this.axios.request<DefaultResponseBody<A, "get", P>>(axiosConfig);
        return res;
    }

    async post<P extends PathByMethod<A, "post">>(path: P, ...[config]: ConfigParam<A, "post", P>) {
        const axiosConfig = ExZodOsClient.buildAxiosConfig("post", path as string, config);
        const res = await this.axios.request<DefaultResponseBody<A, "post", P>>(axiosConfig);
        return res;
    }

    async put<P extends PathByMethod<A, "put">>(path: P, ...[config]: ConfigParam<A, "put", P>) {
        const axiosConfig = ExZodOsClient.buildAxiosConfig("put", path as string, config);
        const res = await this.axios.request<DefaultResponseBody<A, "put", P>>(axiosConfig);
        return res;
    }

    async patch<P extends PathByMethod<A, "patch">>(path: P, ...[config]: ConfigParam<A, "patch", P>) {
        const axiosConfig = ExZodOsClient.buildAxiosConfig("patch", path as string, config);
        const res = await this.axios.request<DefaultResponseBody<A, "patch", P>>(axiosConfig);
        return res;
    }

    async delete<P extends PathByMethod<A, "delete">>(path: P, ...[config]: ConfigParam<A, "delete", P>) {
        const axiosConfig = ExZodOsClient.buildAxiosConfig("delete", path as string, config);
        const res = await this.axios.request<DefaultResponseBody<A, "delete", P>>(axiosConfig);
        return res;
    }

    isErrorOf<M extends MethodByPath<A, P>, P extends Path<A>, C extends ResponseCode<A, M, P>>(err: unknown, method: M, path: P, code: C): err is axios.AxiosError<ResponseBody<A, M, P, C>> & { response: { data: ResponseBody<A, M, P, C> } } {
        if (!(err instanceof axios.AxiosError)) {
            return false;
        }

        const axiosErr = err as axios.AxiosError<ResponseBody<A, M, P, C>>;

        if (axiosErr.config?.method !== method) {
            return false;
        }

        if (axiosErr.config.url !== path) {
            return false;
        }

        if (axiosErr.response?.status !== code) {
            return false;
        }

        return true;
    }

    private static replacePathParams(url: string, path: Record<string, string | number>) {
        let modifiedUrl: string = url;
        Object.keys(path).forEach((key) => {
            modifiedUrl = modifiedUrl.replace(`:${key}`, path[key].toString());
        });
        return modifiedUrl;
    }

    private static buildAxiosConfig(method: Method, path: string, config?: axios.AxiosRequestConfig & {
        header?: axios.RawAxiosRequestHeaders;
        path?: Record<string, string>;
        query?: Record<string, unknown>;
        body?: Record<string, unknown>;
    }) {
        if (!config) {
            //CASE: No config provided
            //NOTE: There must be no path parameters in the url. Safe to return url unmodified.
            return {
                method,
                url: path
            } satisfies axios.AxiosRequestConfig;
        }

        const { path: configPath, header: configHeader, query: configQuery, body: configBody, ...configRest } = config;

        //CASE: Config provided
        return {
            method,
            url: configPath !== undefined ? this.replacePathParams(path, configPath) : path,
            headers: configHeader,
            params: configQuery,
            paramsSerializer: params => qs.stringify(params, { arrayFormat: "brackets" }),
            data: configBody,
            ...configRest
        } satisfies axios.AxiosRequestConfig;
    }
}