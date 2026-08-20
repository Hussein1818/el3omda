import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

interface PrintedBook {
  id: string;
  name: string;
  subject: string;
  stage: number;
  year: number;
  portraitStock: number;
  landscapeStock: number;
}

export default function PrintedBooks() {
  const [books, setBooks] = useState<PrintedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/books/printed-inventory');
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageString = (s: number) => s === 1 ? 'ابتدائي' : s === 2 ? 'إعدادي' : 'ثانوي';
  const getYearString = (y: number) => ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][y - 1] || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المخزون المطبوع (جاهز للتسليم)</h2>
          <p className="mt-1 text-sm text-gray-500">متابعة الكتب الجاهزة على الرفوف لتسليمها فوراً.</p>
        </div>
        <button onClick={fetchInventory} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50">
          تحديث المخزون
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">اسم الكتاب</th>
                <th className="px-6 py-4">المادة</th>
                <th className="px-6 py-4">المرحلة والسنة</th>
                <th className="px-6 py-4 text-center">المخزون الطولي</th>
                <th className="px-6 py-4 text-center">المخزون العرضي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center">جاري التحميل...</td></tr>
              ) : books.length > 0 ? (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{book.name}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{book.subject}</td>
                    <td className="px-6 py-4 text-gray-700">{getStageString(book.stage)} - الصف {getYearString(book.year)}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{book.portraitStock}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{book.landscapeStock}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">لا يوجد كتب جاهزة في المخزون حالياً.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}