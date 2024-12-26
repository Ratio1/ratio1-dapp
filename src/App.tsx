import { Wrappers } from '@lib/wrappers';
import { Button } from '@nextui-org/react';

function App() {
    return (
        <Wrappers>
            <div className="layout center-all">
                {/* TODO: Auto-format tailwind classes */}
                {/* TODO: Fonts */}
                <div className="flex gap-4 flex-col p-8">
                    <h1 className="text-center text-xl font-semibold">Ratio1</h1>

                    <Button isLoading color="primary">
                        Loading
                    </Button>
                </div>
            </div>
        </Wrappers>
    );
}

export default App;
