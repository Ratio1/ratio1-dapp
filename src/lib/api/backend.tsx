import { config } from '@lib/config';
import { KycInfo, PublicProfileInfo } from '@typedefs/general';
import { InvoiceDraft, InvoicingPreferences } from '@typedefs/invoicing';
import axios from 'axios';
import * as types from 'typedefs/blockchain';

const backendUrl = config.backendUrl;

// *****
// GET
// *****

export const getSellerCode = async () => _doGet<string>('seller/code');

export const addReferralCode = (code: string) => _doPost(`accounts/add-seller-code?sellerCode=${code}`, {});

export const getAccount = async () => _doGet<types.ApiAccount>('accounts/account');

export const linkLicense = (nodeAddress: types.EthAddress) =>
    _doGet<{
        signature: `0x${string}`;
    }>(`/license/link?nodeAddress=${nodeAddress}`);

export const emailSubscribe = async () => _doGet<types.ApiAccount>('accounts/subscribe');

export const emailUnsubscribe = async () => _doGet<types.ApiAccount>('accounts/unsubscribe');

export const confirmEmail = async (token: string) => _doGet<types.ApiAccount>(`accounts/email/confirm?token=${token}`);

export const ping = async () => _doGet<any>('/auth/nodeData');

export const getKycInfo = async () => _doGet<KycInfo>('/accounts/kyc-info');

export const getInvoiceDrafts = async (): Promise<InvoiceDraft[]> => _doGet<any>('/invoice-draft/get-drafts');

export const downloadInvoiceDraft = async (draftId: string) => {
    const res = await axiosBackend.get(`/invoice-draft/download-draft?draftId=${draftId}`, {
        responseType: 'blob',
    });

    if (res.status !== 200) {
        throw new Error(`Download failed with status ${res.status}.`);
    }

    // Check if the response is an error (blob with error content)
    if (res.data.type === 'application/json') {
        const text = await res.data.text();
        const errorData = JSON.parse(text);

        if (errorData.error) {
            throw new Error(errorData.error);
        }
    }

    const urlObj = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = draftId;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(urlObj), 0);
};

export const getBrandingPlatforms = async () => _doGet<string[]>('/branding/get-platforms');

export const getProfilePicture = async (address: types.EthAddress) =>
    _doGet<any>(`/branding/get-brand-logo?address=${address}`);

// *****
// POST
// *****

export const accessAuth = (params: { message: string; signature: string }) =>
    _doPost<{
        accessToken: string;
        refreshToken: string;
        expiration: number;
    }>('/auth/access', params);

export const buyLicense = () =>
    _doPost<{
        signature: string;
        uuid: string;
        usdLimitAmount: number;
        vatPercentage: number;
    }>('/license/buy', {});

export const initSumsubSession = (type: 'individual' | 'company') => _doPost<string>('/sumsub/init/Kyc', { type });

export const registerEmail = (params: { email: string; receiveUpdates: boolean }) =>
    _doPost<types.ApiAccount>('/accounts/email/register', params);

export const newSellerCode = (params: { address: string; forcedCode?: string }) =>
    _doPost<types.ApiAccount>('/seller/new', params);

export const sendBatchNews = async (params: { news: File; subject: string }) => {
    const formData = new FormData();
    formData.append('news', params.news);
    formData.append('subject', params.subject);

    const { data } = await axiosBackend.post<{
        data: any;
        error: string;
    }>('/admin/news', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (data.error) {
        throw new Error(data.error);
    }
    return data.data;
};

export const getInvoicingPreferences = async () => _doGet('/invoice-draft/get-preferences');

export const createInvoicingPreferences = (preferences: InvoicingPreferences) =>
    _doPost<any>('/invoice-draft/create-preferences', preferences);

export const changeInvoicingPreferences = (preferences: InvoicingPreferences) =>
    _doPost<any>('/invoice-draft/change-preferences', {
        ...preferences,
        extraTaxes: JSON.stringify(preferences.extraTaxes),
    });

export const getPublicProfileInfo = async (address: types.EthAddress) =>
    _doPost<any>('/branding/get-brands', { brandAddresses: [address] });

export const uploadProfileImage = async (logo: File) => {
    const formData = new FormData();
    formData.append('logo', logo);

    return _doPost<any>('/branding/edit-logo', formData, {
        'Content-Type': 'multipart/form-data',
    });
};

export const updatePublicProfileInfo = async (info: PublicProfileInfo) => _doPost<any>('/branding/edit', info);

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

async function _doPost<T>(endpoint: string, body: any, headers?: Record<string, string>) {
    const { data } = await axiosBackend.post<{
        data: T;
        error: string;
    }>(endpoint, body, {
        headers,
    });
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
        const token = localStorage.getItem('accessToken');
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
