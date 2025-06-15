import { useState, useEffect } from 'react';
import { Layout, Typography, Card, Upload, message, Button, Select, Tag, Space, Row, Col, Collapse, Checkbox, Input } from 'antd';
import { InboxOutlined, DownloadOutlined, UpOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

interface UserData {
  file_name: string;
  business_line?: string;
  role?: string;
  developer_skill?: string;
  generic_skill?: string;
  language_skill?: string;
  [key: string]: any;
}

// 新的筛选条件接口
interface FilterState {
  business_line: string[];
  role: string[];
  developer_skill: string[];
  generic_skill: string[];
  language_skill: string[];
}

interface LabelData {
  business_line: string[];
  role: string[];
  developer_skill: string[];
  generic_skill: string[];
  language_skill: string[];
}

function App() {
  const [uploadedData, setUploadedData] = useState<UserData[]>([]);
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [uploading, setUploading] = useState(false);
  // 修改为新的筛选状态
  const [filterState, setFilterState] = useState<FilterState>({
    business_line: [],
    role: [],
    developer_skill: [],
    generic_skill: [],
    language_skill: []
  });
  const [labelData, setLabelData] = useState<LabelData>({
    business_line: [],
    role: [],
    developer_skill: [],
    generic_skill: [],
    language_skill: []
  });
  const [labelsLoading, setLabelsLoading] = useState(true);
  const [uploadCollapsed, setUploadCollapsed] = useState(false);
  // 搜索状态
  const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({
    business_line: '',
    role: '',
    developer_skill: '',
    generic_skill: '',
    language_skill: ''
  });

  // Load label data
  useEffect(() => {
    const loadLabels = async () => {
      setLabelsLoading(true);
      try {
        const labelFiles = {
          business_line: '/data/business_line_labels.txt',
          role: '/data/role_labels.txt',
          developer_skill: '/data/developer_tech_skills_labels.txt',
          generic_skill: '/data/generic_labels.txt',
          language_skill: '/data/language_labels.txt',
        };

        const newLabelData: LabelData = {
          business_line: [],
          role: [],
          developer_skill: [],
          generic_skill: [],
          language_skill: []
        };

        for (const [dimension, filePath] of Object.entries(labelFiles)) {
          try {
            const response = await fetch(filePath);
            if (response.ok) {
              const text = await response.text();
              const labels = text.split('\n').filter(line => line.trim() !== '');
              newLabelData[dimension as keyof LabelData] = labels;
            } else {
              console.warn(`Cannot load ${dimension} labels file`);
              newLabelData[dimension as keyof LabelData] = getBackupLabels(dimension);
            }
          } catch (error) {
            console.warn(`Failed to load ${dimension} labels:`, error);
            newLabelData[dimension as keyof LabelData] = getBackupLabels(dimension);
          }
        }

        setLabelData(newLabelData);
      } catch (error) {
        console.error('Failed to load label data:', error);
        setLabelData(getBackupLabelData());
      } finally {
        setLabelsLoading(false);
      }
    };

    loadLabels();
  }, []);

  // Apply filters whenever filterState changes
  useEffect(() => {
    if (uploadedData.length > 0) {
      applyFilters();
    }
  }, [filterState, uploadedData]);

  // Backup label data
  const getBackupLabels = (dimension: string): string[] => {
    const backupData: { [key: string]: string[] } = {
      business_line: [
        'Investment Banking - Mergers & Acquisitions (M&A)',
        'Global Markets (including Sales & Trading) - Equities',
        'Global Markets (including Sales & Trading) - FICC',
        'Commercial Banking - Core Lending & Credit Solutions',
        'Retail banking - Core retail banking products'
      ],
      role: [
        'Front Office - Relationship Manager (RM)',
        'Front Office - Trader',
        'Operations - MO',
        'Finance - Product Control'
      ],
      developer_skill: [
        'Developer (Programming) - JavaScript',
        'Developer (Programming) - Python',
        'Developer (Programming) - Java',
        'Developer (Database & Messaging) - MySQL'
      ],
      generic_skill: [
        'Generic-Communication',
        'Generic-Leadership',
        'Generic-Project Management',
        'Generic-Data Analysis'
      ],
      language_skill: [
        'English',
        'Chinese',
        'Japanese',
        'Korean'
      ]
    };
    return backupData[dimension] || [];
  };

  const getBackupLabelData = (): LabelData => ({
    business_line: getBackupLabels('business_line'),
    role: getBackupLabels('role'),
    developer_skill: getBackupLabels('developer_skill'),
    generic_skill: getBackupLabels('generic_skill'),
    language_skill: getBackupLabels('language_skill')
  });

  // Merge user data by file_name
  const mergeUserData = (data: UserData[]): UserData[] => {
    const userMap = new Map<string, UserData>();
    
    data.forEach(row => {
      const fileName = row.file_name;
      if (!userMap.has(fileName)) {
        userMap.set(fileName, { file_name: fileName });
      }
      
      const existingUser = userMap.get(fileName)!;
      
      // Merge dimension data
      ['business_line', 'role', 'developer_skill', 'generic_skill', 'language_skill'].forEach(dimension => {
        if (row[dimension] && row[dimension].toString().trim()) {
          if (!existingUser[dimension]) {
            existingUser[dimension] = row[dimension];
          } else {
            const existing = existingUser[dimension].toString();
            const newValue = row[dimension].toString();
            if (!existing.includes(newValue)) {
              existingUser[dimension] = existing + '; ' + newValue;
            }
          }
        }
      });
    });
    
    return Array.from(userMap.values());
  };

  // Text preprocessing for exact matching
  const preprocessText = (text: string): string => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize spaces
      .trim();
  };

  // Exact match after preprocessing
  const isExactMatch = (excelValue: string, labelValue: string): boolean => {
    const processed1 = preprocessText(excelValue);
    const processed2 = preprocessText(labelValue);
    const match = processed1 === processed2;
    return match;
  };

  // Check if excel value can be filtered (exists in label list)
  const canBeFiltered = (excelValue: string, dimension: string): boolean => {
    const labels = labelData[dimension as keyof LabelData] || [];
    return labels.some(label => isExactMatch(excelValue, label));
  };

  // Handle Excel file upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        message.error('Please upload Excel file (.xlsx or .xls format)');
        setUploading(false);
        return false;
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length === 0) {
        message.error('Excel file is empty');
        setUploading(false);
        return false;
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      console.log('Excel Headers:', headers);
      console.log('First few data rows:', dataRows.slice(0, 3));
      
      // Check if this is long format (dimension-value style) or wide format
      const hasLongFormatColumns = headers.some(h => 
        h && (h.toLowerCase().includes('dimension') || h.toLowerCase().includes('value'))
      );
      
      console.log('Detected format:', hasLongFormatColumns ? 'Long format (dimension-value)' : 'Wide format (direct columns)');

      let excelData: UserData[];

      if (hasLongFormatColumns) {
        // Handle long format: file_name, dimension, value
        console.log('Processing long format data...');
        
        // Normalize column names for long format
        const normalizeColumnNameLong = (name: string): string => {
          const normalized = name.toLowerCase().trim();
          const mapping: { [key: string]: string } = {
            'file_name': 'file_name',
            'filename': 'file_name',
            'file name': 'file_name',
            'name': 'file_name',
            'dimension': 'dimension',
            'dimensions': 'dimension',
            'category': 'dimension',
            'type': 'dimension',
            'value': 'value',
            'values': 'value',
            'label': 'value',
            'content': 'value'
          };
          return mapping[normalized] || normalized;
        };

        // Parse long format data
        const longFormatData = dataRows
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row, index) => {
            const rowData: any = {};
            
            headers.forEach((header, colIndex) => {
              if (header && row[colIndex] !== undefined && row[colIndex] !== '') {
                const normalizedHeader = normalizeColumnNameLong(header);
                rowData[normalizedHeader] = row[colIndex];
              }
            });
            
            if (!rowData.file_name || rowData.file_name.toString().trim() === '') {
              rowData.file_name = `Row_${index + 2}`;
            }
            
            return rowData;
          });

        console.log('Long format parsed data:', longFormatData);

        // Convert long format to wide format
        const wideFormatMap = new Map<string, UserData>();
        
        longFormatData.forEach(row => {
          const fileName = row.file_name;
          const dimension = row.dimension;
          const value = row.value;
          
          if (!fileName || !dimension || !value) {
            console.warn('Skipping row with missing data:', row);
            return;
          }
          
          if (!wideFormatMap.has(fileName)) {
            wideFormatMap.set(fileName, { file_name: fileName });
          }
          
          const user = wideFormatMap.get(fileName)!;
          
          // Normalize dimension names
          const normalizeDimensionName = (dim: string): string => {
            const normalized = dim.toLowerCase().trim();
            const mapping: { [key: string]: string } = {
              'business_line': 'business_line',
              'business line': 'business_line',
              'businessline': 'business_line',
              'role': 'role',
              'roles': 'role',
              'position': 'role',
              'developer_skill': 'developer_skill',
              'developer skill': 'developer_skill',
              'tech skill': 'developer_skill',
              'technical skill': 'developer_skill',
              'programming skill': 'developer_skill',
              'generic_skill': 'generic_skill',
              'generic skill': 'generic_skill',
              'soft skill': 'generic_skill',
              'general skill': 'generic_skill',
              'language_skill': 'language_skill',
              'language skill': 'language_skill',
              'language': 'language_skill'
            };
            return mapping[normalized] || normalized;
          };

          const normalizedDimension = normalizeDimensionName(dimension);
          
          // Add value to the dimension
          if (user[normalizedDimension]) {
            const existing = user[normalizedDimension].toString();
            const newValue = value.toString();
            if (!existing.includes(newValue)) {
              user[normalizedDimension] = existing + '; ' + newValue;
            }
          } else {
            user[normalizedDimension] = value;
          }
        });

        excelData = Array.from(wideFormatMap.values());
        console.log('Converted to wide format:', excelData);

      } else {
        // Handle wide format: file_name, business_line, role, etc. (original logic)
        console.log('Processing wide format data...');
        
        // Normalize column names for wide format
        const normalizeColumnName = (name: string): string => {
          const normalized = name.toLowerCase().trim();
          const mapping: { [key: string]: string } = {
            'file_name': 'file_name',
            'filename': 'file_name',
            'file name': 'file_name',
            'name': 'file_name',
            'business_line': 'business_line',
            'business line': 'business_line',
            'role': 'role',
            'roles': 'role',
            'developer_skill': 'developer_skill',
            'developer skill': 'developer_skill',
            'tech skill': 'developer_skill',
            'generic_skill': 'generic_skill',
            'generic skill': 'generic_skill',
            'language_skill': 'language_skill',
            'language skill': 'language_skill',
            'language': 'language_skill'
          };
          return mapping[normalized] || normalized;
        };

        excelData = dataRows
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row, index) => {
            const rowData: UserData = { file_name: '' };
            
            headers.forEach((header, colIndex) => {
              if (header && row[colIndex] !== undefined && row[colIndex] !== '') {
                const normalizedHeader = normalizeColumnName(header);
                rowData[normalizedHeader] = row[colIndex];
              }
            });
            
            if (!rowData.file_name || rowData.file_name.toString().trim() === '') {
              rowData.file_name = `Row_${index + 2}`;
            }
            
            return rowData;
          });
      }

      console.log('Final parsed Excel Data:', excelData);

      if (excelData.length === 0) {
        message.error('No valid data found in Excel file');
        setUploading(false);
        return false;
      }

      setUploadedData(excelData);
      const mergedData = mergeUserData(excelData);
      setFilteredData(mergedData);
      // 重置筛选状态
      setFilterState({
        business_line: [],
        role: [],
        developer_skill: [],
        generic_skill: [],
        language_skill: []
      });
      // 重置搜索词
      setSearchTerms({
        business_line: '',
        role: '',
        developer_skill: '',
        generic_skill: '',
        language_skill: ''
      });
      message.success(`Successfully loaded ${excelData.length} records, ${mergedData.length} unique users`);
      
      // 上传成功后收起Upload区域
      setUploadCollapsed(true);
      
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      message.error('Failed to parse Excel file, please check the format');
    } finally {
      setUploading(false);
    }
    
    return false;
  };

  // 更新筛选状态
  const updateFilterState = (dimension: keyof FilterState, selectedLabels: string[]) => {
    setFilterState(prev => ({
      ...prev,
      [dimension]: selectedLabels
    }));
  };

  // 清空所有筛选条件
  const clearAllFilters = () => {
    setFilterState({
      business_line: [],
      role: [],
      developer_skill: [],
      generic_skill: [],
      language_skill: []
    });
    // 同时清空搜索词
    setSearchTerms({
      business_line: '',
      role: '',
      developer_skill: '',
      generic_skill: '',
      language_skill: ''
    });
    message.success('All filters cleared! Showing all users.');
  };

  // 检查是否有任何筛选条件
  const hasActiveFilters = Object.values(filterState).some(arr => arr.length > 0);

  // 新的筛选逻辑
  const applyFilters = () => {
    const mergedData = mergeUserData(uploadedData);
    
    const filtered = mergedData.filter(user => {
      // 对每个dimension进行筛选
      const dimensionResults: { [key: string]: boolean } = {};
      
      const dimensions = ['business_line', 'role', 'developer_skill', 'generic_skill', 'language_skill'] as const;
      
      for (const dimension of dimensions) {
        const selectedLabels = filterState[dimension];
        
        // 如果没有选择任何label，则该dimension通过（相当于1）
        if (selectedLabels.length === 0) {
          dimensionResults[dimension] = true;
          continue;
        }
        
        const userValue = user[dimension];
        if (!userValue) {
          dimensionResults[dimension] = false;
          continue;
        }
        
        // Handle multiple values separated by semicolon
        const userValues = userValue.toString().split(';').map((v: string) => v.trim());
        
        // 在该dimension内，只要任何一个用户值匹配任何一个选择的label就通过（OR关系）
        const dimensionMatch = selectedLabels.some(selectedLabel => {
          return userValues.some(userValue => {
            const match = isExactMatch(userValue, selectedLabel);
            return match;
          });
        });
        
        dimensionResults[dimension] = dimensionMatch;
      }
      
      // 所有dimension结果进行AND操作
      const finalResult = Object.values(dimensionResults).every(result => result);
      
      return finalResult;
    });

    setFilteredData(filtered);
  };

  // Export results
  const exportResults = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Results');
      
      const fileName = `filtered_results_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success('Export successful!');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Export failed, please try again');
    }
  };

  const getDimensionDisplayName = (dimension: string): string => {
    const nameMap: { [key: string]: string } = {
      business_line: 'Business Line',
      role: 'Role',
      developer_skill: 'Developer Skills',
      generic_skill: 'Generic Skills',
      language_skill: 'Language Skills'
    };
    return nameMap[dimension] || dimension;
  };

  // 过滤labels基于搜索词
  const getFilteredLabels = (dimension: string): string[] => {
    const labels = labelData[dimension as keyof LabelData] || [];
    const searchTerm = searchTerms[dimension].toLowerCase();
    
    if (!searchTerm) {
      return labels;
    }
    
    return labels.filter(label => 
      label.toLowerCase().includes(searchTerm)
    );
  };

  // 更新搜索词
  const updateSearchTerm = (dimension: string, term: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [dimension]: term
    }));
  };

  const uploadProps = {
    name: 'file',
    accept: '.xlsx,.xls',
    beforeUpload: handleFileUpload,
    showUploadList: false,
    disabled: uploading,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 50px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          📊 Label Filter
        </Title>
        <Text type="secondary" style={{ marginLeft: 16 }}>
          Excel Data Intelligent Filtering Tool
        </Text>
      </Header>

      <Content style={{ padding: '24px 50px' }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>
          
          {/* Instructions - Commented out */}
          {/*
          <Alert
            message="Instructions"
            description={
      <div>
                <p>1. Upload an Excel file containing personnel information (must include file_name column)</p>
                <p>2. Use the dimension filter cards to select labels (click to select/deselect)</p>
                <p>3. Logic: Different dimensions are connected by AND; labels within the same dimension are connected by OR</p>
                <p>4. If no labels are selected for a dimension, that dimension is ignored</p>
                <p>5. View filtered results and export functionality</p>
                <p>6. Only Excel values that exactly match defined labels (after preprocessing) can be filtered</p>
              </div>
            }
            type="info"
            closable
            style={{ marginBottom: 24 }}
          />
          */}

          {/* Debug Panel - Commented out */}
          {/*
          <Card title="🐛 Debug Panel" style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col>
                <Button 
                  type={debugMode ? "primary" : "default"}
                  icon={<BugOutlined />}
                  onClick={() => setDebugMode(!debugMode)}
                >
                  {debugMode ? 'Disable Debug' : 'Enable Debug'}
                </Button>
              </Col>
              <Col>
                <Text type="secondary">
                  {debugMode ? 'Debug mode is ON - check browser console for detailed matching logs' : 'Enable debug to see detailed matching information'}
                </Text>
              </Col>
            </Row>

            {uploadedData.length > 0 && (
              <Collapse style={{ marginTop: 16 }}>
                <Panel header={`Raw Data (${uploadedData.length} records)`} key="1">
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(uploadedData.slice(0, 5), null, 2)}
                      {uploadedData.length > 5 && `\n... and ${uploadedData.length - 5} more records`}
                    </pre>
                  </div>
                </Panel>
                
                <Panel header={`Label Data`} key="2">
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(labelData, null, 2)}
                    </pre>
                  </div>
                </Panel>

                <Panel header={`Current Filter State`} key="3">
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(filterState, null, 2)}
                    </pre>
                  </div>
                </Panel>
              </Collapse>
            )}
          </Card>
          */}
          
          {/* Collapsible File Upload */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📄 File Upload</span>
                <Button 
                  type="text" 
                  icon={uploadCollapsed ? <DownOutlined /> : <UpOutlined />}
                  onClick={() => setUploadCollapsed(!uploadCollapsed)}
                  style={{ marginLeft: 8 }}
                >
                  {uploadCollapsed ? 'Expand' : 'Collapse'}
                </Button>
      </div>
            }
            style={{ marginBottom: 24 }}
          >
            {!uploadCollapsed && (
              <>
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: 16 }}>
                    Click or drag Excel file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support .xlsx and .xls formats, file should contain file_name column
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#ff4d4f' }}>
                    Note: PDF files are not supported. Please convert to Excel format first.
                  </p>
                </Dragger>
                
                {uploading && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Processing file...</Text>
                  </div>
                )}

                {/* Sample data download */}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button 
                    type="link" 
                    href="/sample_data.xlsx" 
                    download="sample_data.xlsx"
                  >
                    📥 Download Sample Excel File
                  </Button>
      </div>
              </>
            )}
            
            {uploadCollapsed && uploadedData.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">
                  ✅ {uploadedData.length} records loaded, {mergeUserData(uploadedData).length} unique users
                </Text>
              </div>
            )}
          </Card>

          {/* Filter Builder with 5 cards in one row */}
          {uploadedData.length > 0 && (
            <Card 
              title="🔍 Filter Builder" 
              style={{ marginBottom: 24 }}
              extra={
                <Button 
                  type="default" 
                  danger={hasActiveFilters}
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  style={{ 
                    opacity: hasActiveFilters ? 1 : 0.6,
                    transition: 'all 0.3s'
                  }}
                >
                  {hasActiveFilters ? '🗑️ Clear All Filters' : '🗑️ No Filters'}
                </Button>
              }
            >
              {labelsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">Loading label data...</Text>
                </div>
              ) : (
                <div>
                  <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    Click labels to select/deselect. Logic: Dimension₁ (Label-A OR Label-B) AND Dimension₂ (Label-C OR Label-D) ...
                  </Text>
                  
                  {/* 5 cards in one row with responsive design */}
                  <Row gutter={[12, 16]}>
                    {(['business_line', 'role', 'developer_skill', 'generic_skill', 'language_skill'] as const).map(dimension => {
                      const filteredLabels = getFilteredLabels(dimension);
                      return (
                        <Col key={dimension} xs={24} sm={12} md={12} lg={8} xl={4.8} xxl={4.8}>
                          <Card
                            size="small"
                            title={
                              <div style={{ textAlign: 'left' }}>
                                <Text strong style={{ fontSize: '14px' }}>{getDimensionDisplayName(dimension)}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                  {filterState[dimension].length > 0 ? `${filterState[dimension].length} selected` : 'All (no filter)'}
                                </Text>
                              </div>
                            }
                            style={{ 
                              height: '450px',
                              border: filterState[dimension].length > 0 ? '2px solid #1890ff' : '1px solid #d9d9d9'
                            }}
                            bodyStyle={{ padding: '8px', height: '370px', display: 'flex', flexDirection: 'column' }}
                          >
                            {/* 搜索框 */}
                            <Input
                              placeholder="Search labels..."
                              prefix={<SearchOutlined />}
                              value={searchTerms[dimension]}
                              onChange={(e) => updateSearchTerm(dimension, e.target.value)}
                              style={{ marginBottom: 8 }}
                              size="small"
                            />
                            
                            {/* 标签列表 */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                              <Checkbox.Group
                                value={filterState[dimension]}
                                onChange={(checkedValues) => updateFilterState(dimension, checkedValues as string[])}
                                style={{ width: '100%' }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size={2}>
                                  {filteredLabels.map(label => (
                                    <Checkbox 
                                      key={label} 
                                      value={label}
                                      style={{ 
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '4px',
                                        margin: '1px 0',
                                        backgroundColor: filterState[dimension].includes(label) ? '#e6f7ff' : '#fafafa',
                                        fontSize: '12px'
                                      }}
                                    >
                                      <Text style={{ fontSize: '12px', wordBreak: 'break-word', lineHeight: '1.2' }}>
                                        {label}
                                      </Text>
                                    </Checkbox>
                                  ))}
                                </Space>
                              </Checkbox.Group>
                              
                              {/* 没有搜索结果时的提示 */}
                              {searchTerms[dimension] && filteredLabels.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    No labels match "{searchTerms[dimension]}"
                                  </Text>
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                  
                  {/* Selected filters summary */}
                  <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong style={{ color: '#1890ff' }}>Active Filters:</Text>
                      {hasActiveFilters && (
                        <Button 
                          size="small" 
                          type="link" 
                          danger
                          onClick={clearAllFilters}
                          style={{ padding: '0 4px', height: 'auto' }}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div>
                      {(['business_line', 'role', 'developer_skill', 'generic_skill', 'language_skill'] as const).map(dimension => {
                        if (filterState[dimension].length === 0) return null;
                        return (
                          <div key={dimension} style={{ marginBottom: 4 }}>
                            <Text strong style={{ fontSize: '12px', color: '#666' }}>
                              {getDimensionDisplayName(dimension)}:
                            </Text>
                            <div style={{ marginLeft: 8, display: 'inline-block' }}>
                              {filterState[dimension].map(label => (
                                <Tag key={label} color="blue" style={{ marginRight: 4, marginBottom: 2, fontSize: '11px' }}>
                                  {label}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Object.values(filterState).every(arr => arr.length === 0) && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>No filters applied - showing all users</Text>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Results Display */}
          {uploadedData.length > 0 && (
            <Card 
              title={`📋 Filter Results (${filteredData.length} / ${mergeUserData(uploadedData).length} users)`} 
              style={{ marginBottom: 24 }}
              extra={
                filteredData.length > 0 && (
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportResults}
                  >
                    Export Results
                  </Button>
                )
              }
            >
              {filteredData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <Text type="secondary">No records match the filter conditions, please adjust the filter conditions</Text>
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {/* Table Header */}
                  <Row style={{ 
                    padding: '12px', 
                    backgroundColor: '#f5f5f5', 
                    fontWeight: 'bold',
                    borderRadius: '6px 6px 0 0',
                    marginBottom: '2px'
                  }}>
                    <Col span={8}>
                      <Text strong>File Name</Text>
                    </Col>
                    <Col span={16}>
                      <Text strong>Labels (Excel Original Values)</Text>
                    </Col>
                  </Row>

                  {filteredData.map((user, index) => (
                    <Row key={index} style={{ 
                      padding: '12px', 
                      margin: '2px 0', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '6px',
                      backgroundColor: '#fafafa'
                    }}>
                      <Col span={8}>
                        <Text strong style={{ color: '#1890ff' }}>
                          {user.file_name}
                        </Text>
                      </Col>
                      <Col span={16}>
                        {['business_line', 'role', 'developer_skill', 'generic_skill', 'language_skill'].map(dimension => {
                          if (user[dimension]) {
                            const values = user[dimension].toString().split(';').map((v: string) => v.trim()).filter((v: string) => v);
                            const filterableValues = values.filter((value: string) => canBeFiltered(value, dimension));
                            const nonFilterableValues = values.filter((value: string) => !canBeFiltered(value, dimension));
                            
                            return (
                              <div key={dimension} style={{ marginBottom: 6 }}>
                                <Text strong style={{ fontSize: '12px', color: '#666' }}>
                                  {getDimensionDisplayName(dimension)}:
                                </Text>
                                <div style={{ marginTop: 2, paddingLeft: 8 }}>
                                  {filterableValues.map((value: string, idx: number) => (
                                    <Tag key={`f-${idx}`} color="green" style={{ marginBottom: 4, marginRight: 4 }}>
                                      {value}
                                    </Tag>
                                  ))}
                                  {nonFilterableValues.map((value: string, idx: number) => (
                                    <Tag key={`nf-${idx}`} color="orange" style={{ marginBottom: 4, marginRight: 4 }}>
                                      {value} (not filterable)
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* System Status - Commented out */}
          {/*
          <Card title="🔧 System Status">
            <p>✅ React working properly</p>
            <p>✅ Ant Design loaded properly</p>
            <p>✅ Excel file parsing integrated</p>
            <p>✅ 5 dimension card-based filtering</p>
            <p>✅ New filter logic: Dimension AND, Label OR</p>
            <p>✅ Exact matching algorithm (after preprocessing)</p>
            <p>✅ Export functionality added</p>
            <p>✅ Debug mode available</p>
            <p>{labelsLoading ? '⏳' : '✅'} Label data: {labelsLoading ? 'Loading...' : 'Loaded successfully'}</p>
            <p>{uploadedData.length > 0 ? '✅' : '⏳'} Data loading: {uploadedData.length > 0 ? `Loaded ${uploadedData.length} records, ${mergeUserData(uploadedData).length} unique users` : 'Waiting for file upload'}</p>
            <p>{Object.values(filterState).some(arr => arr.length > 0) ? '✅' : '⏳'} Filter function: {Object.values(filterState).some(arr => arr.length > 0) ? `Active filters applied, showing ${filteredData.length} users` : 'No filters applied'}</p>
          </Card>
          */}

        </div>
      </Content>
    </Layout>
  );
}

export default App;
