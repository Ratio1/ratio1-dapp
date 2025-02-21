import { ConnectKitButton, SIWEButton } from 'connectkit';

function Wallet() {
    return (
        <div className="row gap-3">
            <ConnectKitButton />
            <SIWEButton showSignOutButton />
        </div>
    );
}

export default Wallet;
