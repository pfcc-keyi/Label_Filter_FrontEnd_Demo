// 数据维度类型
export type Dimension = 'business_line' | 'role' | 'developer_skill' | 'generic_skill' | 'language_skill';

// 筛选条件操作符
export type Operator = 'AND' | 'OR';

// 单个筛选条件
export interface FilterCondition {
  id: string;
  dimension: Dimension;
  selectedLabels: string[];
  operator?: Operator; // 与下一个条件的连接操作符
}

// 筛选表达式节点
export interface FilterExpression {
  id: string;
  type: 'condition' | 'group';
  condition?: FilterCondition;
  children?: FilterExpression[];
  operator?: Operator;
  parentheses?: boolean;
}

// Excel行数据
export interface ExcelRowData {
  file_name: string;
  business_line?: string;
  role?: string;
  developer_skill?: string;
  generic_skill?: string;
  language_skill?: string;
  [key: string]: any;
}

// 标签数据
export interface LabelData {
  business_line: string[];
  role: string[];
  developer_skill: string[];
  generic_skill: string[];
  language_skill: string[];
}

// 筛选结果
export interface FilterResult {
  file_name: string;
  matchedLabels: {
    dimension: Dimension;
    labels: string[];
  }[];
} 