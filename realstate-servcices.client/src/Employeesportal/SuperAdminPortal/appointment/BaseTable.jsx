
import React from 'react';
import { Table, Empty } from 'antd';

const BaseTable = ({ data, columns, loading, rowKey, pagination, ...props }) => {
    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey={rowKey}
            pagination={
                pagination === false
                    ? false
                    : {
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`,
                        ...pagination,
                    }
            }
            scroll={{ x: true }}
            locale={{
                emptyText: (
                    <Empty
                        description="No data found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ),
            }}
            {...props}
        />
    );
};

export default BaseTable;