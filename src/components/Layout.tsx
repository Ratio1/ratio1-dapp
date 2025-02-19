import { BlockchainContextType, useBlockchainContext } from '@lib/contexts/blockchain';
import { Drawer, DrawerBody, DrawerContent } from '@nextui-org/drawer';
import Buy from './Buy';
import Content from './Content';
import MobileTabs from './Mobile/MobileTabs';
import Sider from './Sider';

function Layout() {
    const { isBuyDrawerOpen, onBuyDrawerClose } = useBlockchainContext() as BlockchainContextType;

    return (
        <div className="flex min-h-dvh items-stretch bg-[#fcfcfd] font-mona">
            <div className="hidden layoutBreak:block">
                <Sider />
            </div>

            <div className="relative mb-[76px] min-h-dvh w-full py-6 layoutBreak:mb-0 layoutBreak:ml-[256px] layoutBreak:py-10 lg:py-12">
                <Content />
            </div>

            <div className="block layoutBreak:hidden">
                <MobileTabs />
            </div>

            {/* Global overlays */}
            <Drawer
                isOpen={isBuyDrawerOpen}
                onOpenChange={onBuyDrawerClose}
                size="sm"
                classNames={{
                    base: 'data-[placement=right]:sm:m-3 data-[placement=left]:sm:m-3 rounded-none sm:rounded-medium font-mona',
                }}
                motionProps={{
                    variants: {
                        enter: {
                            opacity: 1,
                            x: 0,
                        },
                        exit: {
                            x: 100,
                            opacity: 0,
                        },
                    },
                }}
                hideCloseButton
            >
                <DrawerContent>
                    <DrawerBody>
                        <Buy onClose={onBuyDrawerClose} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default Layout;
