import React from 'react';
import { Card, Typography } from 'antd';
import type { LabelData, FilterExpression } from '../types';

const { Text } = Typography;

interface FilterBuilderProps {
  labelData: LabelData;
  onFilterChange: (filter: FilterExpression | null) => void;
  disabled?: boolean;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = () => {
  return (
    <Card title="筛选条件构建器">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text type="secondary">筛选功能即将上线...</Text>
      </div>
    </Card>
  );
}; 