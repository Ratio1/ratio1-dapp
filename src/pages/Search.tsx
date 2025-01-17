import { Spinner } from '@heroui/spinner';
import { Input } from '@nextui-org/input';
import { useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';

function Search() {
    const [value, setValue] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <div className="col gap-6">
            <div className="w-[50%]">
                <Input
                    value={value}
                    onValueChange={(value) => {
                        setValue(value);
                    }}
                    size="lg"
                    classNames={{
                        inputWrapper: 'h-[52px] bg-lightAccent hover:!bg-[#eceef6] group-data-[focus=true]:bg-lightAccent px-6',
                    }}
                    variant="flat"
                    radius="full"
                    labelPlacement="outside"
                    placeholder="Search by license number"
                    endContent={
                        <div>
                            {isLoading ? (
                                <Spinner size="sm" color="default" />
                            ) : (
                                <RiSearchLine className="-mr-2.5 cursor-pointer p-2 text-4xl" />
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
}

export default Search;
