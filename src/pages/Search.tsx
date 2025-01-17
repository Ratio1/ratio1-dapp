import Empty from '@assets/empty.png';
import { Input } from '@nextui-org/input';
import { Spinner } from '@nextui-org/spinner';
import { LicenseCard } from '@shared/LicenseCard';
import { useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';

const LICENSE = {
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

    const onSearch = () => {
        setLoading(true);
        console.log('onSearch');

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
                <LicenseCard isExpanded />
            )}
        </div>
    );
}

export default Search;
