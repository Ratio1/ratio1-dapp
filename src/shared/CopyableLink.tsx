import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiLink } from 'react-icons/ri';
import { ClosableToastContent } from './ClosableToastContent';

interface Props {
    value: string;
}

export const CopyableLink = ({ value }: Props) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);

        toast(
            (t) => (
                <ClosableToastContent toastId={t.id} variant="success" icon={<RiLink />}>
                    <div className="col gap-1 text-sm">
                        <div>Link copied. It can be used by others to register using your referral code.</div>
                        <div className="text-xs text-slate-500">{value}</div>
                    </div>
                </ClosableToastContent>
            ),
            {
                position: 'bottom-center',
                duration: 5000,
                style: {
                    width: '500px',
                    maxWidth: '96vw',
                    margin: '1rem',
                },
            },
        );

        setTimeout(() => {
            setCopied(false);
        }, 5000);
    };

    return copied ? (
        <div className="text-sm">Link copied!</div>
    ) : (
        <div
            className="row cursor-pointer gap-1 text-sm text-primary hover:opacity-70"
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCopy();
            }}
        >
            <RiLink className="text-base" />
            <div>Copy link</div>
        </div>
    );
};
