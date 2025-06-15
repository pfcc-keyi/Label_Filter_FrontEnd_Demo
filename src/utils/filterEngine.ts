import type { FilterExpression, ExcelRowData, LabelData } from '../types';

// 简化的筛选函数
export const filterData = (
  data: ExcelRowData[],
  filterExpression: FilterExpression | null,
  labelData: LabelData
): ExcelRowData[] => {
  // 如果没有筛选条件，返回所有数据
  if (!filterExpression) {
    return data;
  }
  
  // 简化的筛选逻辑 - 现在直接返回所有数据
  return data;
}; 