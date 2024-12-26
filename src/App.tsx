import { Wrappers } from '@lib/wrappers';
import { Button } from '@nextui-org/button';

function App() {
    return (
        <Wrappers>
            <div className="layout center-all font-mona">
                <div className="flex flex-col gap-4 p-16">
                    <h1 className="font-mona text-center text-xl font-semibold text-[#4b5563]">Mona Sans - Ratio1</h1>

                    <div className="center-all">
                        <Button isLoading color="primary">
                            Loading
                        </Button>
                    </div>
                </div>
            </div>
        </Wrappers>
    );
}

export default App;
