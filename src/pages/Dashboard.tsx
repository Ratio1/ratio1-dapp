function Dashboard() {
    return (
        <div className="flex w-full flex-col gap-6">
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-softGray flex flex-col gap-6 rounded-3xl px-10 py-10">
                    <div className="flex flex-col gap-3">
                        <div className="text-[26px] font-bold leading-7 text-black">Claimable Rewards</div>
                        <div className="text-[26px] font-bold leading-7 text-primary">$92,239.00</div>
                    </div>
                </div>

                <div className="bg-softGray flex flex-col gap-6 rounded-3xl px-10 py-10">
                    <div className="flex flex-col gap-3">
                        <div className="text-[26px] font-bold leading-7 text-black">RATIO1 Balance</div>
                        <div className="text-[26px] font-bold leading-7 text-primary">255.125</div>
                    </div>
                </div>

                <div className="bg-softGray flex flex-col gap-6 rounded-3xl px-10 py-10">
                    <div className="flex flex-col gap-3">
                        <div className="text-[26px] font-bold leading-7 text-black">Current Epoch</div>
                        <div className="text-[26px] font-bold leading-7 text-slate-500">926</div>
                    </div>
                </div>
            </div>

            <div className="bg-softGray flex w-full flex-col gap-6 rounded-3xl px-10 py-10">
                <div className="text-2xl font-semibold">Node Deed Tiers</div>

                <div className="shadow-light-200/30 flex flex-col gap-4 rounded-2xl border border-[#e3e4e8] bg-light p-6 shadow-sm-light">
                    <div className="text-xl font-medium">Naeural Edge Protocol</div>
                    <div>Visit source code on GitHub.</div>
                    <div>Make beautiful websites regardless of your design experience.</div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
