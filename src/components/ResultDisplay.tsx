import React from 'react';
import { Card, Typography, Empty } from 'antd';
import type { ExcelRowData, LabelData } from '../types';

const { Text, Title } = Typography;

interface ResultDisplayProps {
  data: ExcelRowData[];
  originalData: ExcelRowData[];
  labelData: LabelData;
  loading?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  data, 
  originalData
}) => {
  if (data.length === 0 && originalData.length === 0) {
    return (
      <Card title="筛选结果">
        <Empty description="请先上传Excel文件" />
      </Card>
    );
  }

  return (
    <Card title={`筛选结果 (${data.length}条记录)`}>
      <div>
        {data.map((item, index) => (
          <div key={index} style={{ 
            padding: '12px', 
            margin: '8px 0', 
            border: '1px solid #f0f0f0', 
            borderRadius: '6px' 
          }}>
            <Title level={5} style={{ margin: 0 }}>
              {item.file_name}
            </Title>
            {item.business_line && (
              <Text type="secondary">业务线: {item.business_line}</Text>
            )}
            {item.role && (
              <div>
                <Text type="secondary">角色: {item.role}</Text>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}; 