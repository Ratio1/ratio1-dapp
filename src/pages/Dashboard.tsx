import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Divider } from '@nextui-org/divider';

function Dashboard() {
    return (
        <div className="flex w-full max-w-5xl flex-col gap-10">
            <div className="flex flex-col gap-2">
                <div className="text-[26px] font-bold leading-7 text-black">Claimable rewards</div>
                <div className="text-[26px] font-bold leading-7 text-primary">$92,239.00</div>
            </div>

            <Card className="max-w-[400px]" shadow="sm">
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md">NextUI</p>
                        <p className="text-small text-default-500">nextui.org</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <p>Make beautiful websites regardless of your design experience.</p>
                </CardBody>
                <Divider />
                <CardFooter>
                    <div>Visit source code on GitHub.</div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default Dashboard;
