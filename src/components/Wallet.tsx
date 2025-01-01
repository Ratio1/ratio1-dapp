import { Button } from '@nextui-org/button';
import { RiWallet3Line } from 'react-icons/ri';

function Wallet() {
    return (
        <Button className="h-12 rounded-2xl" variant="solid" color="primary">
            <div className="flex items-center gap-2">
                <div className="text-[22px]">
                    <RiWallet3Line />
                </div>

                <div className="text-base font-semibold">0.2675 ETH</div>
                {/* <div className="text-base font-semibold">Login</div> */}
            </div>
        </Button>
    );
}

export default Wallet;
