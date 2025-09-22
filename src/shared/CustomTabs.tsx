import { Tab, Tabs } from '@heroui/tabs';
import { ReactNode } from 'react';
import { SmallTag } from './SmallTag';

export default function CustomTabs({
    tabs,
    selectedKey,
    onSelectionChange,
    isCompact = false,
}: {
    tabs: {
        key: string;
        title: string;
        icon?: ReactNode;
        count?: number;
    }[];
    selectedKey?: string;
    onSelectionChange: (key) => void;
    isCompact?: boolean;
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
                cursor: `group-data-[selected=true]:bg-[#EFF2F6] ${isCompact ? 'rounded-md' : ''}`,
                tab: isCompact ? 'h-[30px]' : 'h-10',
                tabList: `p-1 ${isCompact ? 'border-default-200 border rounded-lg' : 'border-[#EFF2F6] border-2'} !shadow-none bg-[#fdfdfd]`,
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
                            {!!tab.icon && <div className="text-lg">{tab.icon}</div>}

                            {tab.title}

                            {tab.count !== undefined && (
                                <div className="mx-0.5">
                                    <SmallTag variant="slate">{tab.count ?? 0}</SmallTag>
                                </div>
                            )}
                        </div>
                    }
                />
            ))}
        </Tabs>
    );
}
