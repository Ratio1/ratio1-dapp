function Wallet() {
    return (
        <div className="row gap-3">
            <div className="web-only-block">
                <appkit-network-button />
            </div>

            <appkit-button />
        </div>
    );
}

export default Wallet;
