import { AxiosError } from "axios";
export type TApiError = AxiosError<{
    code?: string;
    message?: string;
}>;
export type TApiErrorResponse = {
    status: number;
    data?: TApiError;
};
