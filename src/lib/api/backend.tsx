import axios from 'axios';
import * as types from 'typedefs/blockchain';

const backendUrl = 'https://ratio1-backend.ngrok.app';

// *****
// GET
// *****

//TODO here can also store in redux for example
export const getAccount = async () => _doGet<types.ApiAccount>('accounts/account');

export const emailSubscribe = async () => _doGet<types.ApiAccount>('accounts/subscribe');

export const emailUnsubscribe = async () => _doGet<types.ApiAccount>('accounts/unsubscribe');

export const confirmEmail = async (token: string) => _doGet<types.ApiAccount>(`accounts/email/confirm?token=${token}`);

export const ping = async () => _doGet<any>('/auth/nodeData');

// *****
// POST
// *****

export const accessAuth = (params: { message: string; signature: string }) =>
    _doPost<{
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }>('/auth/access', params);

export const buyLicense = (params: types.BuyLicenseRequest) =>
    _doPost<{
        signature: string;
        uuid: string;
    }>('/license/buy', params);

export const initSumsubSession = (type: 'individual' | 'company') => _doPost<string>('/sumsub/init/Kyc', { type });

export const registerEmail = (params: { email: string; receiveUpdates: boolean }) =>
    _doPost<types.ApiAccount>('/accounts/email/register', params);

// *****
// INTERNAL HELPERS
// *****

async function _doGet<T>(endpoint: string) {
    const { data } = await axiosBackend.get<{
        data: T;
        error: string;
    }>(endpoint);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

async function _doPost<T>(endpoint: string, body: any) {
    const { data } = await axiosBackend.post<{
        data: T;
        error: string;
    }>(endpoint, body);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

const axiosBackend = axios.create({
    baseURL: backendUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosBackend.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('accessToken'); //TODO check where this should be taken from
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosBackend.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                return axiosBackend
                    .post('/auth/refresh', {
                        refreshToken: refreshToken,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            return axiosBackend(originalRequest);
                        }
                        return axiosBackend(originalRequest);
                    });
            }
        }
        return error.response;
    },
);
