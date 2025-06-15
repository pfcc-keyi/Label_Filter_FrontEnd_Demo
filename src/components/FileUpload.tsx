import React from 'react';
import { Card, Button, Typography } from 'antd';
import type { ExcelRowData } from '../types';

const { Text } = Typography;

interface FileUploadProps {
  onDataLoad: (data: ExcelRowData[]) => void;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad, loading = false }) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 简化的文件处理逻辑
      console.log('文件已选择:', file.name);
      // 模拟数据加载
      const mockData: ExcelRowData[] = [
        { file_name: 'User 1', business_line: 'Investment Banking', role: 'Analyst' },
        { file_name: 'User 2', business_line: 'Global Markets', role: 'Trader' }
      ];
      onDataLoad(mockData);
    }
  };

  return (
    <Card title="文件上传">
      <div style={{ padding: '20px', textAlign: 'center', border: '2px dashed #d9d9d9', borderRadius: '8px' }}>
        <Text>点击选择Excel文件上传</Text>
        <br />
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileSelect}
          style={{ margin: '10px 0' }}
          disabled={loading}
        />
        <br />
        <Text type="secondary">支持 .xlsx 和 .xls 格式</Text>
      </div>
    </Card>
  );
}; 