import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

interface PrintStatistic {
  bookId: string;
  bookName: string;
  subject: string;
  stage: number;
  year: number;
  printFormat: number;
  totalToPrint?: number;
}

export default function Dashboard() {
  const [printStatistics, setPrintStatistics] = useState<PrintStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/dashboard/print-statistics');
      setPrintStatistics(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard statistics", error);
      setErrorMsg('حدث خطأ أثناء جلب إحصائيات الطباعة. تأكد من اتصال الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintNext = async (bookId: string, format: number) => {
    try {
      await api.post('/dashboard/print-next', { bookId, format });
      fetchStatistics();
    } catch (error) {
      console.error("Failed to register print", error);
      alert('حدث خطأ أثناء تسجيل الطباعة.');
    }
  };

  const getStageString = (stage: number) => {
    if (stage === 1) return 'ابتدائي';
    if (stage === 2) return 'إعدادي';
    if (stage === 3) return 'ثانوي';
    return 'غير محدد';
  };

  const getStageColorClass = (stage: number) => {
    if (stage === 1) return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (stage === 2) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (stage === 3) return 'bg-purple-100 text-purple-800 border border-purple-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getYearString = (year: number) => {
    const years = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];
    return years[year - 1] || 'غير محدد';
  };

  const getFormatString = (format: number) => {
    return format === 1 ? 'A4 طولي' : 'A4 عرضي';
  };

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  const sortedStats = [...printStatistics].sort((a, b) => (b.totalToPrint || 0) - (a.totalToPrint || 0));
  
  const filteredStats = sortedStats.filter(stat => 
    normalizeArabic(stat.bookName).includes(normalizeArabic(searchTerm)) || 
    normalizeArabic(stat.subject).includes(normalizeArabic(searchTerm))
  );

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المطلوب طباعته</h2>
          <p className="mt-1 text-sm text-gray-500">مرحباً بك! إليك ملخص بالكتب المطلوب طباعتها وتجهيزها للحجوزات الحالية.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ابحث باسم الكتاب أو المادة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-600 focus:outline-none min-w-[250px]"
          />
          <button 
            onClick={fetchStatistics}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            تحديث البيانات
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 shrink-0">
          {errorMsg}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0">
          <h3 className="font-semibold text-gray-800">قائمة التشغيل (مهام الطباعة المعلقة مرتبة بالأكثر طلباً)</h3>
        </div>
        <div className="overflow-y-auto flex-1 h-[calc(100vh-250px)]">
          <table className="w-full text-right text-sm text-gray-500 relative">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">اسم الكتاب</th>
                <th className="px-6 py-4">المادة</th>
                <th className="px-6 py-4">المرحلة / السنة</th>
                <th className="px-6 py-4">الصيغة</th>
                <th className="px-6 py-4 text-center">المطلوب وتأكيد الطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  </td>
                </tr>
              ) : filteredStats.length > 0 ? (
                filteredStats.map((stat, idx) => {
                  const displayCount = stat.totalToPrint ?? 0;
                  return (
                    <tr key={idx} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{stat.bookName}</td>
                      <td className="px-6 py-4 font-medium text-blue-600">{stat.subject}</td>
                      <td className="px-6 py-4 text-xs font-medium">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${getStageColorClass(stat.stage)}`}>
                          {getStageString(stat.stage)}
                        </span>
                        <span className="text-gray-500 ml-2">{getYearString(stat.year)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-blue-50 text-blue-700 px-2 py-1 text-xs border border-blue-100">
                          {getFormatString(stat.printFormat)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                            {displayCount}
                          </span>
                          <button 
                            onClick={() => handlePrintNext(stat.bookId, stat.printFormat)} 
                            className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm"
                          >
                            تم طباعة نسخة
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">لا توجد مهام طباعة مطابقة للبحث.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}