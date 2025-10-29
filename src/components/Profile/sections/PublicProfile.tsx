import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { getBrandingPlatforms, getPublicProfileInfo } from '@lib/api/backend';
import { config, getDevAddress, isUsingDevAddress } from '@lib/config';
import { DetailsCard } from '@shared/cards/DetailsCard';
import ProfileRow from '@shared/ProfileRow';
import { useQuery } from '@tanstack/react-query';
import { EthAddress } from '@typedefs/blockchain';
import { BRANDING_PLATFORM_NAMES, PublicProfileInfo } from '@typedefs/general';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { HiUser } from 'react-icons/hi';
import { useAccount } from 'wagmi';
import EditPublicProfile from '../EditPublicProfile';
import ImageUpload from '../ImageUpload';
import ProfileSectionWrapper from '../ProfileSectionWrapper';

const EMPTY_PROFILE: PublicProfileInfo = {
    name: '',
    description: '',
    links: {},
};

export default function PublicProfile() {
    const [isImageLoading, setImageLoading] = useState<boolean>(true);
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageRefreshToken, setImageRefreshToken] = useState<number>(0);

    const [isEditing, setEditing] = useState<boolean>(false);

    const { address } = isUsingDevAddress ? getDevAddress() : useAccount();

    const { data: brandingPlatforms = [], isLoading: isLoadingBrandingPlatforms } = useQuery<string[]>({
        queryKey: ['brandingPlatforms'],
        queryFn: async () => {
            try {
                const response = await getBrandingPlatforms();

                if (!response) {
                    console.log('Error fetching branding platforms.');
                }

                return response ?? [];
            } catch (error) {
                console.error('Error fetching branding platforms.');
                throw error;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    const {
        data: profileInfo = EMPTY_PROFILE,
        isLoading: isLoadingProfileInfo,
        isFetching: isFetchingProfileInfo,
        isError: isPublicProfileError,
        refetch: refetchPublicProfileInfo,
    } = useQuery<PublicProfileInfo>({
        queryKey: ['publicProfile', address],
        queryFn: async () => {
            if (!address) {
                return EMPTY_PROFILE;
            }

            try {
                const response = await getPublicProfileInfo(address as EthAddress);

                if (!response || !response?.brands?.[0] || response?.brands?.[0]?.links === undefined) {
                    console.log('Error fetching public profile info.');
                }

                return response?.brands?.[0] ?? EMPTY_PROFILE;
            } catch (error) {
                console.error('Error fetching public profile info.');
                throw error;
            }
        },
        enabled: address !== undefined,
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (isPublicProfileError) {
            toast.error('Failed to fetch public profile.');
        }
    }, [isPublicProfileError]);

    const isLoading: boolean =
        isLoadingBrandingPlatforms || isLoadingProfileInfo || isFetchingProfileInfo || address === undefined;

    // Build the image URL once (with cache-busting param when refreshed)
    const profileImageUrl = useMemo(() => {
        if (!address) {
            return '';
        }

        const base = `${config.backendUrl}/branding/get-brand-logo?address=${address}`;
        return imageRefreshToken ? `${base}&t=${imageRefreshToken}` : base;
    }, [address, imageRefreshToken]);

    return (
        <ProfileSectionWrapper>
            <div className="col gap-2">
                {/* Image */}
                <div className="col items-center gap-3">
                    <div className="center-all relative h-[84px] w-[84px] overflow-hidden rounded-[37.5%]">
                        {/* Placeholder */}
                        <div className="center-all absolute h-full w-full bg-slate-200 text-6xl text-white">
                            <HiUser />
                        </div>

                        {/* Loading */}
                        {isImageLoading && <Skeleton className="absolute h-full w-full" />}

                        <img
                            src={profileImageUrl}
                            alt="Profile"
                            className={clsx('z-10 h-full w-full object-cover object-center', {
                                'opacity-0': isImageLoading || imageError,
                            })}
                            onLoad={() => {
                                setImageLoading(false);
                            }}
                            onError={() => {
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                    </div>

                    <div className="col items-center gap-2">
                        <ImageUpload
                            onSuccessfulUpload={() => {
                                // Bust cached image and re-attempt load
                                setImageError(false);
                                setImageRefreshToken(Date.now());
                            }}
                            setImageLoading={setImageLoading}
                        />

                        <div className="text-sm text-slate-500">Only .jpg, .jpeg, and .png images are allowed.</div>
                    </div>
                </div>

                {/* Details */}
                {isEditing ? (
                    <EditPublicProfile
                        profileInfo={profileInfo}
                        brandingPlatforms={brandingPlatforms}
                        setEditing={setEditing}
                        onEdit={() => {
                            setEditing(false);
                            refetchPublicProfileInfo();
                        }}
                    />
                ) : (
                    <>
                        <div className="section-title">Name</div>

                        {isLoading ? (
                            <Skeleton className="h-[52px] w-full rounded-xl" />
                        ) : (
                            <DetailsCard>
                                <div className="compact">
                                    {profileInfo?.name?.length > 0 ? (
                                        profileInfo?.name
                                    ) : (
                                        <div className="text-slate-500">—</div>
                                    )}
                                </div>
                            </DetailsCard>
                        )}

                        <div className="section-title">Description</div>

                        {isLoading ? (
                            <Skeleton className="h-[72px] w-full rounded-xl" />
                        ) : (
                            <DetailsCard>
                                <div className="compact">
                                    {profileInfo?.description?.length > 0 ? (
                                        profileInfo?.description
                                    ) : (
                                        <div className="text-slate-500">—</div>
                                    )}
                                </div>
                            </DetailsCard>
                        )}

                        <div className="section-title">Links</div>

                        {isLoading ? (
                            <Skeleton className="h-[116px] w-full rounded-xl" />
                        ) : (
                            <DetailsCard>
                                <div className="col gap-4 sm:gap-1.5">
                                    {brandingPlatforms
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((platform) => {
                                            const value = profileInfo?.links?.[platform];

                                            const displayValue =
                                                value && typeof value === 'string' && value.length > 0 ? (
                                                    value
                                                ) : (
                                                    <div className="text-slate-500">—</div>
                                                );

                                            return (
                                                <ProfileRow
                                                    key={platform}
                                                    label={BRANDING_PLATFORM_NAMES[platform] ?? platform}
                                                    value={displayValue}
                                                />
                                            );
                                        })}
                                </div>
                            </DetailsCard>
                        )}

                        <div className="center-all mt-2">
                            <Button
                                className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                                color="default"
                                size="sm"
                                variant="solid"
                                onPress={() => setEditing(true)}
                                isDisabled={isLoading}
                            >
                                <div className="text-sm">Edit profile</div>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ProfileSectionWrapper>
    );
}
