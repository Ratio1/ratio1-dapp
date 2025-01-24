import Empty from '@assets/empty.png';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { LicenseCard } from '@shared/Licenses/LicenseCard';
import { subHours } from 'date-fns';
import { useEffect, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { LinkedLicense } from 'types';

const LICENSE: LinkedLicense = {
    id: 5564,
    alias: 'naeural_396c2f29',
    node_address: '0x71c4255E9ACa4E1Eb41167056F2f9dCC6DbBB58a',
    rewards: 112,
    used: 5800,
    assignTimestamp: subHours(new Date(), 24),
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
    }, [licenseId]);

    const onSearch = () => {
        const sanitizedNumber = value.replace('License', '').replace('Licence', '').replace('#', '').trim();

        if (!sanitizedNumber) {
            return;
        }

        setLoading(true);

        setSearchParams({ licenseId: sanitizedNumber });

        setTimeout(() => {
            setLoading(false);
            setResult(LICENSE);
        }, 500);
    };

    return (
        <div className="col h-full gap-4 lg:gap-6">
            <div className="w-full lg:w-[50%]">
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
                <div className="center-all col gap-1.5 p-8">
                    <img src={Empty} alt="Empty" className="h-28" />
                    <div className="text-sm text-slate-400">Search for a license</div>
                </div>
            ) : (
                <LicenseCard license={LICENSE} isExpanded disableActions />
            )}
        </div>
    );
}

export default Search;
