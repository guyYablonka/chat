import axios, { AxiosRequestConfig } from 'axios';
import stringify from 'fast-safe-stringify';

export default function createAxios(config: AxiosRequestConfig) {
    const instance = axios.create(config);

    instance.interceptors.request.use(
        config => config,
        error => {
            const parsedError = JSON.parse(stringify(error));

            return Promise.reject({
                message: parsedError.message,
                method: parsedError.request.method,
                route: parsedError.request.path
            });
        }
    );
    instance.interceptors.response.use(
        response => response,
        error => {
            const parsedError = JSON.parse(stringify(error));

            const { request, config, ...relevantData } =
                parsedError?.response ?? parsedError;
            return Promise.reject({ ...relevantData });
        }
    );

    return instance;
}
