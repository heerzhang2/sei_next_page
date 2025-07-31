"use client"
// components/VerticalHeaderTable.tsx
import React from 'react';

interface Record {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  location: string;
  projects: number;
}

interface Field {
  label: string;
  key: keyof Record;
  render?: (value: any) => React.ReactNode;
}

const VerticalHeaderTable = () => {
  // 模拟数据（最多4条）
  const data: Record[] = [
    { id: 1, name: '张明', email: 'zhang@example.com', role: '管理员', status: 'active', joinDate: '2023-01-15', location: '北京', projects: 12 },
    { id: 3, name: '王芳', email: 'wang@example.com', role: '开发工程师', status: 'inactive', joinDate: '2023-05-30', location: '广州', projects: 15 },
    { id: 4, name: '赵伟', email: 'zhao@example.com', role: '产品经理', status: 'active', joinDate: '2023-07-11', location: '深圳', projects: 6 },
  ];

  // 定义要显示的字段（标签和键名）
  const fields: Field[] = [
    { label: 'ID', key: 'id' },
    { label: '姓名', key: 'name' },
    { label: '邮箱', key: 'email' },
    { label: '角色', key: 'role' },
    {
      label: '状态',
      key: 'status',
      render: (value) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              value === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
          }`}>
          {value === 'active' ? '活跃' : '未激活'}
        </span>
      )
    },
    { label: '加入日期', key: 'joinDate' },
    { label: '地点', key: 'location' },
    {
      label: '项目数',
      key: 'projects',
      render: (value) => (
          <div className="flex items-center">
            <span className="mr-2">{value}</span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(value * 6, 100)}%` }}
              ></div>
            </div>
          </div>
      )
    },
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">垂直表头表格布局</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              这种布局将表头垂直排列在左侧，数据记录水平排列在右侧，特别适合字段较多的数据展示。
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">团队成员信息</h2>
                <div className="flex space-x-3">
                  <button className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                    导出
                  </button>
                  <button className="px-3 py-1 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition">
                    添加成员
                  </button>
                </div>
              </div>
            </div>

            {/* 表格容器 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                {fields.map((field) => (
                    <tr key={field.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* 垂直表头单元格 */}
                      <th
                          scope="row"
                          className="py-3 px-4 text-left font-semibold text-gray-700 bg-gray-50 whitespace-nowrap border-r border-gray-100"
                      >
                        {field.label}
                      </th>

                      {/* 数据单元格 - 水平排列 */}
                      {data.map((record) => (
                          <td key={`${field.key}-${record.id}`} className="py-3 px-4">
                            {field.render
                                ? field.render(record[field.key])
                                : record[field.key] as React.ReactNode
                            }
                          </td>
                      ))}

                      {/* 当记录不足4条时，用空单元格填充 */}
                      {Array.from({ length: 4 - data.length }).map((_, idx) => (
                          <td key={`empty-${field.key}-${idx}`} className="py-3 px-4 bg-gray-50"> / </td>
                      ))}
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* 表格底部信息 */}
            <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
              <div className="text-sm text-gray-600">
                显示 {data.length} 条记录（最多4条）
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
                  上一页
                </button>
                <button className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
                  下一页
                </button>
              </div>
            </div>
          </div>

          {/* 布局说明 */}
          <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-3">垂直表头布局特点</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">垂直排列表头便于在移动设备上阅读</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">每条记录水平排列，便于比较</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">支持自定义渲染函数显示复杂数据</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-2 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">自动填充空单元格保持布局一致</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default VerticalHeaderTable;
