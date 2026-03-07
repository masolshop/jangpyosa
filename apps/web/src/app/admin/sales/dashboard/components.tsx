// ==================== Dashboard Common Components ====================

import React from 'react';

// ==================== StatCard ====================

interface StatCardProps {
  icon: string;
  title: string;
  value: number;
  unit?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  unit = "개",
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
            <span className="text-sm font-normal ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== InfoRow ====================

interface InfoRowProps {
  label: string;
  value?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900">{value || '-'}</span>
  </div>
);

// ==================== RefreshControl ====================

interface RefreshControlProps {
  autoRefresh: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
  onManualRefresh: () => void;
  lastUpdated: Date;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  autoRefresh,
  onAutoRefreshChange,
  onManualRefresh,
  lastUpdated,
}) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => onAutoRefreshChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">자동 새로고침 (30초)</span>
      </label>
      <button
        onClick={onManualRefresh}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        🔄 지금 새로고침
      </button>
    </div>
    <div className="text-sm text-gray-500">
      마지막 업데이트: {lastUpdated.toLocaleTimeString()}
    </div>
  </div>
);

// ==================== LoadingSpinner ====================

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "로딩 중...",
}) => (
  <div className="text-center py-8 text-gray-500">
    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    <p className="mt-2">{message}</p>
  </div>
);

// ==================== EmptyState ====================

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = "📭",
}) => (
  <div className="text-center py-12 text-gray-500">
    <span className="text-4xl mb-2 block">{icon}</span>
    {message}
  </div>
);

// ==================== MessageAlert ====================

interface MessageAlertProps {
  type: 'success' | 'error' | '';
  message: string;
  onClose?: () => void;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({
  type,
  message,
  onClose,
}) => {
  if (!message || !type) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const icon = type === 'success' ? '✓' : '⚠️';

  return (
    <div className={`p-4 rounded-lg ${bgColor} ${textColor} flex items-center justify-between`}>
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ==================== ReportTable ====================

interface ReportTableProps {
  data: Array<{
    month?: string;
    quarter?: string;
    totalReferrals: number;
    activeReferrals: number;
    privateCompanies: number;
    publicCompanies: number;
    governmentCompanies: number;
  }>;
  period: 'monthly' | 'quarterly';
}

export const ReportTable: React.FC<ReportTableProps> = ({ data, period }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
            {period === 'monthly' ? '월' : '분기'}
          </th>
          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">총 추천</th>
          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">활성</th>
          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">민간</th>
          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">공공</th>
          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">정부</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((report, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-900">
              {period === 'monthly' ? report.month : report.quarter}
            </td>
            <td className="px-4 py-3 text-sm text-right text-gray-900">
              {report.totalReferrals.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
              {report.activeReferrals.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-sm text-right text-gray-600">
              {report.privateCompanies.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-sm text-right text-gray-600">
              {report.publicCompanies.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-sm text-right text-gray-600">
              {report.governmentCompanies.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
