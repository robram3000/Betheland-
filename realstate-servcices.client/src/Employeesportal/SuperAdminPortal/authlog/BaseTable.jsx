// BaseTable.jsx
import React from 'react';
import { Table, Empty, ConfigProvider } from 'antd';

const BaseTable = ({
    data,
    columns,
    loading = false,
    rowKey = 'id',
    pagination = true,
    ...props
}) => {
    const customPagination = pagination === true ? {
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
    } : pagination;

    return (
        <ConfigProvider
            renderEmpty={() => (
                <Empty
                    description="No data found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        >
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey={rowKey}
                pagination={customPagination}
                scroll={{ x: 800 }}
                size="middle"
                {...props}
            />
        </ConfigProvider>
    );
};

export default BaseTable;