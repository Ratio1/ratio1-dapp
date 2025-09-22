import { InputProps } from '@heroui/input';
import { SmallTag } from '@shared/SmallTag';
import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';
import StyledInput from './StyledInput';

interface Props extends InputProps {
    name: string;
    label: string;
    placeholder?: string;
    tag?: string;
    hasWarning?: boolean;
}

export default function NumberInputWithLabel({ name, label, placeholder, tag, hasWarning, ...props }: Props) {
    const { control } = useFormContext();

    return (
        <div className="col w-full gap-2">
            <div className="row gap-1.5">
                <Label value={label} />
                {!!tag && <SmallTag>{tag}</SmallTag>}
            </div>

            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <StyledInput
                            placeholder={placeholder ?? '0'}
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? '' : Number(value));
                            }}
                            onBlur={field.onBlur}
                            isInvalid={!!fieldState.error}
                            errorMessage={fieldState.error?.message}
                            showsWarning={hasWarning}
                            {...props}
                        />
                    );
                }}
            />
        </div>
    );
}
