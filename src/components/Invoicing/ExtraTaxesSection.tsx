import { EXTRA_TAX_TYPES } from '@data/extraTaxTypes';
import CustomTabs from '@shared/CustomTabs';
import Label from '@shared/form/Label';
import StyledInput from '@shared/form/StyledInput';
import VariableSectionIndex from '@shared/form/VariableSectionIndex';
import VariableSectionRemove from '@shared/form/VariableSectionRemove';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { RiAddLine } from 'react-icons/ri';

export default function ExtraTaxesSection() {
    const { control, formState } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'extraTaxes',
    });

    // Get array-level errors
    const errors = formState.errors.extraTaxes;

    return (
        <div className="col gap-2">
            <div className="col gap-2">
                <Label value="Extra Taxes" />

                {fields.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No extra taxes added yet.</div>
                ) : (
                    fields.map((field, index) => {
                        // Get the error for this specific extra tax entry
                        const entryError = errors?.[index];

                        return (
                            <div className="col gap-2" key={field.id}>
                                <div className="flex gap-3">
                                    <VariableSectionIndex index={index} />

                                    <div className="flex flex-1 items-start gap-2">
                                        <Controller
                                            name={`extraTaxes.${index}.taxType`}
                                            control={control}
                                            render={({ field }) => (
                                                <CustomTabs
                                                    tabs={EXTRA_TAX_TYPES.map((option) => ({
                                                        key: option,
                                                        title: option,
                                                    }))}
                                                    selectedKey={field.value}
                                                    onSelectionChange={(key) => {
                                                        field.onChange(key);
                                                    }}
                                                    isCompact
                                                />
                                            )}
                                        />

                                        <Controller
                                            name={`extraTaxes.${index}.value`}
                                            control={control}
                                            render={({ field, fieldState }) => {
                                                // Watch the taxType value for this specific index
                                                const taxType = useWatch({
                                                    control,
                                                    name: `extraTaxes.${index}.taxType`,
                                                });

                                                // Watch the localCurrency value
                                                const localCurrency = useWatch({
                                                    control,
                                                    name: 'localCurrency',
                                                });

                                                return (
                                                    <StyledInput
                                                        placeholder="0"
                                                        type="number"
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === '' ? '' : Number(value));
                                                        }}
                                                        onBlur={field.onBlur}
                                                        isInvalid={!!fieldState.error}
                                                        errorMessage={fieldState.error?.message}
                                                        endContent={
                                                            taxType === 'Percentage' ? (
                                                                <div className="text-sm text-slate-500">%</div>
                                                            ) : taxType === 'Fixed' ? (
                                                                <div className="text-sm text-slate-500">
                                                                    {localCurrency || ''}
                                                                </div>
                                                            ) : null
                                                        }
                                                    />
                                                );
                                            }}
                                        />
                                    </div>

                                    <VariableSectionRemove onClick={() => remove(index)} />
                                </div>

                                <Controller
                                    name={`extraTaxes.${index}.description`}
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        // Check for specific error on this key input or array-level error
                                        const specificError = entryError?.description;
                                        const hasError = !!fieldState.error || !!specificError || !!errors?.root?.message;

                                        return (
                                            <StyledInput
                                                placeholder="Description"
                                                value={field.value ?? ''}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value);
                                                }}
                                                isInvalid={hasError}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    specificError?.message ||
                                                    (errors?.root?.message && index === 0 ? errors.root.message : undefined)
                                                }
                                            />
                                        );
                                    }}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {fields.length < 50 && (
                <div
                    className="row compact text-primary cursor-pointer gap-0.5 hover:opacity-50"
                    onClick={() =>
                        append({
                            description: '',
                            taxType: EXTRA_TAX_TYPES[0],
                            value: '',
                        })
                    }
                >
                    <RiAddLine className="text-lg" /> Add
                </div>
            )}
        </div>
    );
}
