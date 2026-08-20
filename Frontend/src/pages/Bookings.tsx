import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

const stageYears: Record<string, string[]> = {
  'ابتدائي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  'إعدادي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
  'ثانوي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
};

interface Book {
  id: string;
  name: string;
  subject: string;
  stage: number;
  year: number;
  portraitPrice: number;
  landscapePrice: number;
}

interface Booking {
  id: string;
  studentName: string;
  bookName: string;
  printFormat: number;
  paidAmount: number;
  remainingAmount: number;
  isDelivered: boolean;
  createdAt: string;
  deliveryDate: string | null;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStage, setFilterStage] = useState('ابتدائي');
  const [filterYear, setFilterYear] = useState('الصف الأول');

  const [newBooking, setNewBooking] = useState({
    studentName: '',
    bookId: '',
    format: 1, 
    paidAmount: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchBooks();
  }, []);

  const fetchBookings = async (search = '') => {
    try {
      const response = await api.get(`/bookings?searchTerm=${search}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setAvailableBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchBookings(value);
  };

  const selectedBook = availableBooks.find(b => b.id === newBooking.bookId);
  const currentBookPrice = selectedBook 
    ? (newBooking.format === 1 ? selectedBook.portraitPrice : selectedBook.landscapePrice) 
    : 0;
  const currentPaid = parseFloat(newBooking.paidAmount) || 0;
  const calculatedRemaining = Math.max(0, currentBookPrice - currentPaid);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    if (currentPaid > currentBookPrice) {
      setErrorMsg(`لا يمكن أن يكون المبلغ المدفوع (${currentPaid} ج.م) أكبر من سعر الطباعة (${currentBookPrice} ج.م)!`);
      setIsLoading(false);
      return;
    }
    
    try {
      await api.post('/bookings', {
        studentName: newBooking.studentName,
        bookId: newBooking.bookId,
        printFormat: newBooking.format,
        paidAmount: currentPaid
      });

      await fetchBookings(searchTerm);
      setIsModalOpen(false);
      setNewBooking({ studentName: '', bookId: '', format: 1, paidAmount: '' });
    } catch (error: any) {
      let errorMessage = 'Failed to create booking.';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(' | ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsDelivered = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/deliver`);
      await fetchBookings(searchTerm);
    } catch (error) {
      console.error("Failed to mark as delivered", error);
      alert('حدث خطأ أثناء تأكيد التسليم.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
    try {
      await api.delete(`/bookings/${id}`);
      await fetchBookings(searchTerm);
    } catch (error) {
      console.error("Failed to delete booking", error);
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  const handleFilterStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = e.target.value;
    setFilterStage(stage);
    setFilterYear(stageYears[stage][0]);
    setNewBooking({...newBooking, bookId: ''});
  };

  const stageMap: Record<string, number> = { 'ابتدائي': 1, 'إعدادي': 2, 'ثانوي': 3 };
  const yearMap: Record<string, number> = { 
    'الصف الأول': 1, 'الصف الثاني': 2, 'الصف الثالث': 3, 
    'الصف الرابع': 4, 'الصف الخامس': 5, 'الصف السادس': 6 
  };

  const filteredBooks = availableBooks.filter(
    b => b.stage === stageMap[filterStage] && b.year === yearMap[filterYear]
  );

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    }).format(date);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الحجوزات والطلبات</h2>
          <p className="mt-1 text-sm text-gray-500">إدارة حجوزات الطلاب وطلبات الطباعة.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ابحث باسم الطالب أو الكتاب..." 
            value={searchTerm}
            onChange={handleSearch}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-600 focus:outline-none min-w-[250px]"
          />
          <button 
            onClick={() => { setIsModalOpen(true); setErrorMsg(''); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            حجز جديد
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">اسم الطالب</th>
                <th className="px-6 py-4">اسم الكتاب</th>
                <th className="px-6 py-4">الصيغة</th>
                <th className="px-6 py-4">المدفوع</th>
                <th className="px-6 py-4">المتبقي</th>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{booking.studentName}</td>
                  <td className="px-6 py-4 text-gray-700">{booking.bookName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 border border-gray-200">
                      {booking.printFormat === 1 ? 'A4 طولي' : 'A4 عرضي'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{booking.paidAmount} ج.م</td>
                  <td className={`px-6 py-4 font-bold ${booking.remainingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {booking.remainingAmount} ج.م
                  </td>
                  <td className="px-6 py-4 text-xs font-medium">
                    <div className="text-gray-600">الحجز: {formatDateTime(booking.createdAt)}</div>
                    {booking.isDelivered && booking.deliveryDate && (
                      <div className="text-green-600 mt-1 font-bold">التسليم: {formatDateTime(booking.deliveryDate)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!booking.isDelivered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>قيد الانتظار
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>تم التسليم
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {!booking.isDelivered ? (
                        <button 
                          onClick={() => markAsDelivered(booking.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                          تأكيد
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium px-2">مكتمل</span>
                      )}
                      
                      <span className="text-gray-300">|</span>
                      
                      <button 
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="font-medium text-red-600 transition-colors hover:text-red-800 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">لا توجد حجوزات متاحة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">حجز كتاب جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">اسم الطالب <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={newBooking.studentName}
                  onChange={(e) => setNewBooking({...newBooking, studentName: e.target.value})}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-500">تصفية بالمرحلة</label>
                  <select 
                    value={filterStage} 
                    onChange={handleFilterStageChange} 
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">تصفية بالسنة</label>
                  <select 
                    value={filterYear} 
                    onChange={(e) => {
                      setFilterYear(e.target.value);
                      setNewBooking({...newBooking, bookId: ''});
                    }} 
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                  >
                    {stageYears[filterStage]?.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">الكتاب المتاح <span className="text-red-500">*</span></label>
                <select
                  required
                  value={newBooking.bookId}
                  onChange={(e) => {
                    setNewBooking({...newBooking, bookId: e.target.value});
                    setErrorMsg('');
                  }}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="" disabled>اختر كتاباً...</option>
                  {filteredBooks.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.name} ({book.subject}) - {newBooking.format === 1 ? book.portraitPrice : book.landscapePrice} ج.م
                    </option>
                  ))}
                </select>
                {filteredBooks.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">لا يوجد كتب مسجلة لهذه المرحلة والسنة حالياً.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">صيغة الطباعة</label>
                  <select
                    value={newBooking.format}
                    onChange={(e) => {
                      setNewBooking({...newBooking, format: parseInt(e.target.value)});
                      setErrorMsg('');
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value={1}>طولي (Portrait)</option>
                    <option value={2}>عرضي (Landscape)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المبلغ المدفوع (ج.م)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max={currentBookPrice || ''}
                    value={newBooking.paidAmount}
                    onChange={(e) => {
                      setNewBooking({...newBooking, paidAmount: e.target.value});
                      setErrorMsg('');
                    }}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {selectedBook && (
                <div className="rounded-lg bg-red-50 p-3 border border-red-100 flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-red-800">المبلغ المتبقي للطباعة:</span>
                  <span className="text-lg font-bold text-red-700">{calculatedRemaining} ج.م</span>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  إلغاء
                </button>
                <button type="submit" disabled={!newBooking.bookId || isLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}