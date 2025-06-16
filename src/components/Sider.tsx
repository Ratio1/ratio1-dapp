import Logo from '@assets/logo_app.svg';
import NetworkAndStatus from '@shared/NetworkAndStatus';
import Navigation from './Navigation';

function Sider() {
    return (
        <div className="col fixed bottom-0 left-0 top-0 m-4 w-[302px] justify-between rounded-xl bg-slate-100 px-6 pb-8 pt-12">
            <div className="col gap-8">
                <div className="center-all">
                    <img src={Logo} alt="Logo" className="h-7" />
                </div>

                <Navigation />
            </div>

            <NetworkAndStatus />
        </div>
    );
}

export default Sider;
