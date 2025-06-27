import { Spinner } from '@heroui/spinner';
import { Label } from './Label';

export default function SyncingOraclesTag({ variant = 'blue' }: { variant?: 'blue' | 'default' }) {
    return variant === 'blue' ? (
        <Label
            text={
                <div className="row gap-2">
                    <Spinner className="-mt-0.5" size="sm" variant="dots" />
                    <div className="whitespace-nowrap">Syncing oracles</div>
                </div>
            }
            variant="blue"
        />
    ) : (
        <Label
            text={
                <div className="row gap-1.5 px-1 py-1">
                    <Spinner className="-mt-0.5" size="sm" variant="dots" />
                    <div className="whitespace-nowrap">Syncing oracles</div>
                </div>
            }
            variant="default"
        />
    );
}
