import { DetailedAlert } from '@shared/DetailedAlert';
import { RiCloseLargeLine } from 'react-icons/ri';

function Unauthorized() {
    return (
        <div className="col w-full gap-6">
            <DetailedAlert
                variant="red"
                icon={<RiCloseLargeLine />}
                title="Unauthorized"
                description={
                    <div className="col">
                        <div>You are not authorized to access this page.</div>
                        <div>Please ensure you are logged in with the appropriate permissions.</div>
                    </div>
                }
            />
        </div>
    );
}

export default Unauthorized;
