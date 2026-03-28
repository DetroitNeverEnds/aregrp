import React from 'react';
import classNames from 'classnames';
import styles from './Tabs.module.scss';
import { Flex } from '../Flex';
import Text from '../Text';

export type Tab = {
    value: string;
    label: string | React.ReactNode;
};

export type TabsProps = {
    value: string;
    onChange: (value: string) => void;
    tabs: Tab[];
};

export function Tabs({ value: currentValue, onChange, tabs }: TabsProps) {
    return (
        <Flex direction="row" align="baseline" gap={0} role="tablist">
            {tabs.map(tab => (
                <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={tab.value === currentValue}
                    className={classNames(styles.tab, {
                        [styles['tab--selected']]: tab.value === currentValue,
                    })}
                    onClick={() => {
                        if (tab.value !== currentValue) {
                            onChange(tab.value);
                        }
                    }}
                >
                    <div className={styles.tab__lable}>
                        <Text
                            variant="12-med"
                            color={tab.value === currentValue ? 'gray-100' : 'gray-70'}
                        >
                            {tab.label}
                        </Text>
                    </div>
                    <div className={styles.tabBorder} />
                </button>
            ))}
        </Flex>
    );
}
