import type { LabelData } from '../types';

// 加载标签数据的简化版本
export const loadLabelData = async (): Promise<LabelData> => {
  // 模拟数据加载
  return {
    business_line: ['Investment Banking', 'Global Markets', 'Commercial Banking'],
    role: ['Analyst', 'Trader', 'Manager'],
    developer_skill: ['JavaScript', 'Python', 'Java'],
    generic_skill: ['Communication', 'Leadership', 'Analysis'],
    language_skill: ['English', 'Chinese', 'Japanese']
  };
}; 