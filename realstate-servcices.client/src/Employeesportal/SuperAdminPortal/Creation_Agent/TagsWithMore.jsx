import React, { useState } from 'react';
import { Tag, Dropdown, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const TagsWithMore = ({ items, maxDisplay = 2, color = 'blue' }) => {
    const [visible, setVisible] = useState(false);

    if (!items || !Array.isArray(items) || items.length === 0) {
        return <Tag>None</Tag>;
    }

    const displayItems = items.slice(0, maxDisplay);
    const remainingItems = items.slice(maxDisplay);

    const handleVisibleChange = (flag) => {
        setVisible(flag);
    };

    const menuItems = remainingItems.map((item, index) => ({
        key: index,
        label: (
            <div style={{ padding: '4px 8px' }}>
                {item}
            </div>
        ),
    }));

    return (
        <Space size={[0, 4]} wrap>
            {displayItems.map((item, index) => (
                <Tag key={index} color={color}>
                    {item}
                </Tag>
            ))}
            {remainingItems.length > 0 && (
                <Dropdown
                    menu={{ items: menuItems }}
                    onOpenChange={handleVisibleChange}
                    open={visible}
                    trigger={['click']}
                >
                    <Button
                        type="link"
                        size="small"
                        style={{
                            padding: '0 4px',
                            height: 'auto',
                            fontSize: '12px'
                        }}
                    >
                        +{remainingItems.length} more
                        <DownOutlined />
                    </Button>
                </Dropdown>
            )}
        </Space>
    );
};

export default TagsWithMore;