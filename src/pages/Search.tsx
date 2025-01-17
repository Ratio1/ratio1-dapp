import Empty from '@assets/empty.png';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { useEffect, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { AssignedLicense } from 'types';

const LICENSE: AssignedLicense = {
    id: 5564,
    alias: 'naeural_396c2f29',
    node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
    rewards: 112,
    used: 5800,
};

function Search() {
    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    const [result, setResult] = useState<any>();

    const [searchParams, setSearchParams] = useSearchParams();

    const licenseId = searchParams.get('licenseId');

    useEffect(() => {
        if (licenseId) {
            setValue(licenseId);
            onSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [licenseId]);

    const onSearch = () => {
        const sanitizedNumber = value.replace('License', '').replace('Licence', '').replace('#', '').trim();

        if (!sanitizedNumber) {
            return;
        }

        console.log('sanitized', sanitizedNumber);

        setLoading(true);

        setSearchParams({ licenseId: sanitizedNumber });

        setTimeout(() => {
            setLoading(false);
            setResult(LICENSE);
        }, 500);
    };

    return (
        <div className="col h-full gap-6">
            <div className="w-[50%]">
                <Input
                    value={value}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch();
                        }
                    }}
                    onValueChange={(value) => {
                        setValue(value);
                    }}
                    isDisabled={isLoading}
                    size="lg"
                    classNames={{
                        inputWrapper: 'h-[52px] bg-lightAccent hover:!bg-[#eceef6] group-data-[focus=true]:bg-lightAccent px-6',
                    }}
                    variant="flat"
                    radius="full"
                    labelPlacement="outside"
                    placeholder="Search by license number"
                    endContent={
                        <div className="center-all -mr-2.5 cursor-pointer p-2 text-[22px]">
                            {isLoading ? (
                                <Spinner size="sm" color="primary" />
                            ) : (
                                <div
                                    onClick={() => {
                                        onSearch();
                                    }}
                                >
                                    <RiSearchLine />
                                </div>
                            )}
                        </div>
                    }
                />
            </div>

            {!result ? (
                <div className="center-all h-full">
                    <img src={Empty} alt="Empty" className="h-28" />
                </div>
            ) : (
                <LicenseCard license={LICENSE} isExpanded disableActions />
            )}
        </div>
    );
}

export default Search;
