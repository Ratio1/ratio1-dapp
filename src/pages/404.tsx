import { RiCloseLargeLine } from 'react-icons/ri';

function NotFound() {
    return (
        <div className="col w-full gap-6">
            <div className="center-all col gap-6 p-6">
                <div className="center-all rounded-full bg-red-100 p-6">
                    <RiCloseLargeLine className="text-4xl text-red-500" />
                </div>

                <div className="col gap-1 px-10 text-center">
                    <div className="text-3xl font-bold uppercase tracking-wider text-primary-800">404</div>

                    <div className="text-slate-400">
                        <div>The page of resource you're trying to reach is invalid or it doesn't exist anymore.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
