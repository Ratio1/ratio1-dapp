import * as types from 'types';
import { backendUrl } from '../config';
import axios from 'axios';

// *****
// GET
// *****

/*
export async function getConfig() {
    const config = await _doGet<GlobalConfig>('/config');
    store.dispatch(setConfig(config));
    return config;
}

export async function getAccount() {
    const account = await _doGet<ApiAccount>('accounts/account');
    store.dispatch(setAccount(account));
    return account;
}

export async function getLockingPoints() {
    try {
        const points = await _doGet<number>('accounts/locking-points');
        store.dispatch(setLockingPoints(points));
        return points;
    } catch (e) {
        return 0;
    }
}

export async function setUpdatesSubscribe(receiveUpdates: boolean) {
    const account = await _doGet<ApiAccount>(`/accounts/${receiveUpdates ? 'subscribe' : 'unsubscribe'}`);
    store.dispatch(setAccount(account));
    return account;
}

export async function confirmEmail(token: string) {
    const account = await _doGet<ApiAccount>(`/accounts/email/confirm?token=${token}`);
    store.dispatch(setAccount(account));
    return account;
}
*/

// *****
// POST
// *****

export const buyLicense = (params: types.BuyLicenseRequest) =>
    _doPost<{
        signature: string;
        uuid: string;
    }>('/license/buy', params);

/*
export async function registerEmail(params: { email: string; receiveUpdates: boolean }) {
    const account = await _doPost<ApiAccount>(`/accounts/email/register`, params);
    store.dispatch(setAccount(account));
    return account;
}
export async function initKycSession() {
    return _doPost<{
        session_id: string;
        sandbox: boolean;
    }>('/synaps/init', {});
}

*/

// *****
// INTERNAL HELPERS
// *****

async function _doGet<T>(endpoint: string) {
    const { data } = await axiosAuth.get<{
        data: T;
        error: string;
    }>(endpoint);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

async function _doPost<T>(endpoint: string, body: any) {
    const { data } = await axiosAuth.post<{
        data: T;
        error: string;
    }>(endpoint, body);
    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
}

const axiosAuth = axios.create({
    baseURL: backendUrl,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosAuth.interceptors.request.use(
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

axiosAuth.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                return axiosAuth
                    .post('/auth/refresh', {
                        refreshToken: refreshToken,
                    })
                    .then((res) => {
                        if (res.status === 200) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            return axiosAuth(originalRequest);
                        }
                        return axiosAuth(originalRequest);
                    });
            }
        }
        return error.response;
    },
);
