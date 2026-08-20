import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

interface AuditLog {
  id: string;
  actionType: number;
  entityName: string;
  amount: number | null;
  details: string | null;
  createdAt: string;
}

const actionTypeNames: Record<number, string> = {
  1: 'إنشاء حجز',
  2: 'تحديث مالي',
  3: 'استرجاع حجز',
  4: 'تأكيد طباعة',
  5: 'تسليم كتاب',
  6: 'حذف حجز'
};

const actionTypeColors: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-amber-100 text-amber-800 border-amber-200',
  3: 'bg-purple-100 text-purple-800 border-purple-200',
  4: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  5: 'bg-green-100 text-green-800 border-green-200',
  6: 'bg-red-100 text-red-800 border-red-200'
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/auditlogs');
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">سجل الحركات (Audit Log)</h2>
          <p className="mt-1 text-sm text-gray-500">متابعة دقيقة لكل العمليات المالية والإدارية في النظام.</p>
        </div>
        <button onClick={fetchLogs} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
          تحديث السجل
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">نوع الحركة</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4 font-bold text-gray-900">المبلغ المالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center">جاري التحميل...</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${actionTypeColors[log.actionType] || 'bg-gray-100 text-gray-800'}`}>
                      {actionTypeNames[log.actionType] || 'عملية غير معروفة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{log.details}</td>
                  <td className={`px-6 py-4 font-bold ${log.amount && log.amount < 0 ? 'text-red-600' : log.amount && log.amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {log.amount ? `${log.amount > 0 ? '+' : ''}${log.amount} ج.م` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}