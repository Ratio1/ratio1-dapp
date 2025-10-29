import { Button } from '@heroui/button';
import { uploadProfileImage } from '@lib/api/backend';
import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export default function ImageUpload({
    onSuccessfulUpload,
    setImageLoading,
}: {
    onSuccessfulUpload: () => void;
    setImageLoading: (loading: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            setImageLoading(true);

            const file = event.target.files?.[0];

            if (!file) {
                return;
            }

            if (file.size > 500_000) {
                const message = 'Image size must not exceed 500 KB.';
                toast.error(message);
                event.target.value = '';
                return;
            }

            try {
                await uploadProfileImage(file);
                onSuccessfulUpload();

                // Takes into account the response time of the image request
                setTimeout(() => {
                    toast.success('Profile image updated successfully.');
                }, 500);
            } catch (err) {
                console.error('Profile image upload failed:', err);
                toast.error('Failed to upload profile image.');
                setImageLoading(false);
            } finally {
                // Reset the input so the same file can be uploaded twice in a row if needed
                event.target.value = '';
            }
        },
        [onSuccessfulUpload],
    );

    const handleButtonClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    return (
        <div className="row gap-2.5">
            <input
                ref={inputRef}
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button
                className="h-9 border-2 border-slate-200 bg-white data-[hover=true]:opacity-65!"
                color="default"
                size="sm"
                variant="solid"
                onPress={handleButtonClick}
            >
                <div className="text-sm">Upload image...</div>
            </Button>
        </div>
    );
}
