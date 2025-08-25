import { Tab, Tabs } from '@heroui/tabs';
import { ReactNode } from 'react';
import { SmallTag } from './SmallTag';

export default function CustomTabs({
    tabs,
    selectedKey,
    onSelectionChange,
}: {
    tabs: {
        key: string;
        title: string;
        icon: ReactNode;
        count?: number;
    }[];
    selectedKey?: string;
    onSelectionChange: (key) => void;
}) {
    return (
        <Tabs
            aria-label="Tabs"
            color="primary"
            variant="bordered"
            radius="md"
            size="lg"
            selectedKey={selectedKey}
            classNames={{
                cursor: 'group-data-[selected=true]:bg-[#EFF2F6]',
                tab: 'h-10',
                tabList: 'p-1 border-[#EFF2F6] !shadow-none',
                tabContent: 'text-sm group-data-[selected=true]:text-body',
            }}
            onSelectionChange={(key) => {
                onSelectionChange(key);
            }}
        >
            {tabs.map((tab) => (
                <Tab
                    key={tab.key}
                    title={
                        <div className="row gap-1.5">
                            <div className="text-lg">{tab.icon}</div>
                            {tab.title}

                            <div className="mx-0.5">
                                <SmallTag variant="slate">{tab.count ?? 0}</SmallTag>
                            </div>
                        </div>
                    }
                />
            ))}
        </Tabs>
    );
}
