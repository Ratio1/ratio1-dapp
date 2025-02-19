import { DetailedAlert } from '@shared/DetailedAlert';
import { RiCloseLargeLine } from 'react-icons/ri';

function NotFound() {
    return (
        <div className="col w-full gap-6">
            <DetailedAlert
                variant="red"
                icon={<RiCloseLargeLine />}
                title="404"
                description={<div>The page or resource you're trying to reach is invalid or it doesn't exist anymore.</div>}
                largeTitle
            />
        </div>
    );
}

export default NotFound;
