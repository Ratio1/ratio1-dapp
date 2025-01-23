import { routePath } from '@lib/routes';
import { Button } from '@nextui-org/button';
import { useEffect } from 'react';
import { RiCheckLine, RiCpuLine, RiMailCheckLine, RiShieldCheckLine } from 'react-icons/ri';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function EmailConfirmation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            console.log('Invalid token');
            navigate(routePath.notFound);
        } else {
            // TODO: Validate token
            console.log(token);
        }
    }, [token]);

    return (
        <div className="col w-full gap-6">
            <div className="center-all col gap-6 p-6">
                <div className="center-all rounded-full bg-green-100 p-6">
                    <RiMailCheckLine className="text-4xl text-green-500" />
                </div>

                <div className="col gap-1 px-10 text-center">
                    <div className="font-bold uppercase tracking-wider text-primary-800">
                        Thank you for confirming your email!
                    </div>

                    <div className="text-slate-400">
                        <div>Your email has been successfully confirmed.</div>
                        <div>You may now proceed with completing your KYC (Know Your Customer) verification.</div>
                    </div>
                </div>

                <div className="col mt-6 w-[512px] gap-2">
                    <div className="row relative justify-between">
                        <div className="col center-all z-10 w-[150px] gap-4">
                            <div className="center-all outline-6 h-12 w-12 outline outline-[#fcfcfd]">
                                <div className="center-all h-full w-full rounded-full bg-primary">
                                    <RiCheckLine className="text-3xl text-white" />
                                </div>
                            </div>

                            <div className="font-medium text-primary-800">Email Confirmed</div>
                        </div>
                        <div className="col center-all z-10 w-[150px] gap-4">
                            <div className="center-all outline-6 h-12 w-12 rounded-full bg-primary p-[2.5px] outline outline-[#fcfcfd]">
                                <div className="center-all h-full w-full rounded-full bg-[#fcfcfd]">
                                    <RiShieldCheckLine className="text-3xl text-primary" />
                                </div>
                            </div>

                            <div className="font-medium text-primary-800">Complete KYC</div>
                        </div>

                        <div className="col center-all z-10 w-[150px] gap-4">
                            <div className="center-all outline-6 h-12 w-12 rounded-full bg-primary p-[2.5px] outline outline-[#fcfcfd]">
                                <div className="center-all h-full w-full rounded-full bg-[#fcfcfd]">
                                    <RiCpuLine className="text-3xl text-primary" />
                                </div>
                            </div>

                            <div className="font-medium text-primary-800">Buy License</div>
                        </div>

                        <div className="absolute left-[75px] right-[75px] top-6 h-[2.5px] bg-primary"></div>
                    </div>
                </div>

                <div className="mt-4">
                    <Link to={routePath.profileKyc}>
                        <Button color="primary" size="md" variant="solid">
                            <div className="text-base font-medium">Go to KYC</div>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EmailConfirmation;
