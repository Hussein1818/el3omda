import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

const stageYears: Record<string, string[]> = {
  'ابتدائي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  'إعدادي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
  'ثانوي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
};

const subjectsList = [
  'اللغة العربية', 'اللغة الإنجليزية', 'اللغة الفرنسية', 'اللغة الألمانية',
  'الرياضيات', 'العلوم', 'الدراسات الاجتماعية', 'الفيزياء', 'الكيمياء',
  'الأحياء', 'التاريخ', 'الجغرافيا', 'علم النفس والاجتماع', 'الفلسفة والمنطق',
  'الجبر والهندسة الفراغية', 'التفاضل والتكامل', 'الاستاتيكا', 'الديناميكا',
  'تكنولوجيا المعلومات (ICT)', 'المهارات المهنية'
];

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
  subject: string;
  stage: number;
  year: number;
  printFormat: number;
  paidAmount: number;
  remainingAmount: number;
  isPrinted: boolean;
  isDelivered: boolean;
  createdAt: string;
  deliveryDate: string | null;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{isOpen: boolean, id: string, amount: string}>({isOpen: false, id: '', amount: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStage, setFilterStage] = useState('ابتدائي');
  const [filterYear, setFilterYear] = useState('الصف الأول');
  const [filterSubject, setFilterSubject] = useState(subjectsList[0]);

  const [newBooking, setNewBooking] = useState({
    studentName: '',
    bookName: '',
    format: 1,
    paidAmount: '',
    portraitPrice: '',
    landscapePrice: ''
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

  const stageMap: Record<string, number> = { 'ابتدائي': 1, 'إعدادي': 2, 'ثانوي': 3 };
  const yearMap: Record<string, number> = { 
    'الصف الأول': 1, 'الصف الثاني': 2, 'الصف الثالث': 3, 
    'الصف الرابع': 4, 'الصف الخامس': 5, 'الصف السادس': 6 
  };

  const exactMatchBook = availableBooks.find(b => 
    b.stage === stageMap[filterStage] && 
    b.year === yearMap[filterYear] && 
    b.subject === filterSubject && 
    b.name.trim().toLowerCase() === newBooking.bookName.trim().toLowerCase()
  );

  const currentBookPrice = exactMatchBook 
    ? (newBooking.format === 1 ? exactMatchBook.portraitPrice : exactMatchBook.landscapePrice)
    : (newBooking.format === 1 ? parseFloat(newBooking.portraitPrice) : parseFloat(newBooking.landscapePrice)) || 0;
  
  const currentPaid = parseFloat(newBooking.paidAmount) || 0;
  const calculatedRemaining = Math.max(0, currentBookPrice - currentPaid);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    if (currentPaid > currentBookPrice) {
      setErrorMsg(`المبلغ المدفوع (${currentPaid}) لا يمكن أن يكون أكبر من سعر الطباعة (${currentBookPrice})!`);
      setIsLoading(false);
      return;
    }
    
    try {
      let bookIdToUse = exactMatchBook?.id;

      if (!bookIdToUse) {
        const bookResponse = await api.post('/books', {
          name: newBooking.bookName,
          subject: filterSubject,
          stage: stageMap[filterStage],
          year: yearMap[filterYear],
          portraitPrice: parseFloat(newBooking.portraitPrice) || 0,
          landscapePrice: parseFloat(newBooking.landscapePrice) || 0
        });
        bookIdToUse = bookResponse.data.bookId;
        await fetchBooks(); 
      }

      await api.post('/bookings', {
        studentName: newBooking.studentName,
        bookId: bookIdToUse,
        printFormat: newBooking.format,
        paidAmount: currentPaid
      });

      await fetchBookings(searchTerm);
      setIsBookingModalOpen(false);
      setNewBooking({ studentName: '', bookName: '', format: 1, paidAmount: '', portraitPrice: '', landscapePrice: '' });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'حدث خطأ أثناء الحجز.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsDelivered = async (id: string) => {
    try { 
      await api.patch(`/bookings/${id}/deliver`); 
      fetchBookings(searchTerm); 
    } catch (e) { 
      alert('خطأ في التأكيد.'); 
    }
  };

  const markAsPrinted = async (id: string) => {
    try { 
      await api.patch(`/bookings/${id}/print`); 
      fetchBookings(searchTerm); 
    } catch (e) { 
      alert('خطأ في التأكيد.'); 
    }
  };

  const handleUndoPrint = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء حالة الطباعة؟ سيتم إرجاع الكتاب لقائمة المطلوب طباعته وخصمه من المخزون.')) return;
    try { 
      await api.patch(`/bookings/${id}/undo-print`); 
      fetchBookings(searchTerm); 
    } catch (e) { 
      alert('حدث خطأ أثناء الإلغاء.'); 
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.patch(`/bookings/${paymentModalData.id}/payment`, { amount: parseFloat(paymentModalData.amount) });
      await fetchBookings(searchTerm);
      setPaymentModalData({ isOpen: false, id: '', amount: '' });
    } catch (e) {
      alert('خطأ أثناء تحديث الدفعة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('حذف هذا الحجز بشكل نهائي؟')) return;
    try { 
      await api.delete(`/bookings/${id}`); 
      fetchBookings(searchTerm); 
    } catch (e) { 
      alert('خطأ أثناء الحذف.'); 
    }
  };

  const getStageString = (s: number) => s === 1 ? 'ابتدائي' : s === 2 ? 'إعدادي' : 'ثانوي';
  const getYearString = (y: number) => ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][y - 1] || '';

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الحجوزات والطلبات</h2>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ابحث باسم الطالب أو الكتاب..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); fetchBookings(e.target.value); }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-600 focus:outline-none min-w-[250px]"
          />
          <button 
            onClick={() => { setIsBookingModalOpen(true); setErrorMsg(''); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            حجز جديد
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-4">اسم الطالب</th>
                <th className="px-4 py-4">الكتاب</th>
                <th className="px-4 py-4">المادة/السنة</th>
                <th className="px-4 py-4">المدفوع / المتبقي</th>
                <th className="px-4 py-4 text-center">حالة الطباعة</th>
                <th className="px-4 py-4 text-center">التسليم</th>
                <th className="px-4 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-gray-900">{booking.studentName}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {booking.bookName} <br/>
                    <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">
                      {booking.printFormat === 1 ? 'A4 طولي' : 'A4 عرضي'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium">
                    <span className="text-gray-800">{booking.subject}</span><br/>
                    <span className="text-gray-500">{getStageString(booking.stage)} - الصف {getYearString(booking.year)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-green-600 font-bold">{booking.paidAmount} ج.م</div>
                    <div className={booking.remainingAmount > 0 ? 'text-red-600 font-bold text-xs' : 'text-gray-400 text-xs'}>
                      متبقي: {booking.remainingAmount} ج.م
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {booking.isPrinted ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">تمت الطباعة</span>
                        {!booking.isDelivered && (
                          <button onClick={() => handleUndoPrint(booking.id)} className="text-[10px] text-gray-500 hover:text-red-600 underline transition-colors">
                            تراجع
                          </button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => markAsPrinted(booking.id)} className="text-xs font-medium text-white bg-gray-800 hover:bg-gray-900 px-3 py-1.5 rounded-md transition">
                        تأكيد الطباعة
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {booking.isDelivered ? (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">مكتمل</span>
                    ) : (
                      <button disabled={!booking.isPrinted} onClick={() => markAsDelivered(booking.id)} className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md disabled:opacity-40 transition">
                        تسليم للطالب
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setPaymentModalData({isOpen: true, id: booking.id, amount: ''})} className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-2 py-1 rounded transition-colors">الدفعة</button>
                      <button onClick={() => handleDeleteBooking(booking.id)} className="text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 px-2 py-1 rounded transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">لا توجد حجوزات متاحة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">حجز ذكي</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm bg-red-50 p-2 rounded font-medium border border-red-200">{errorMsg}</div>}
              <div>
                <label className="text-sm font-medium text-gray-700">اسم الطالب <span className="text-red-500">*</span></label>
                <input required type="text" value={newBooking.studentName} onChange={(e) => setNewBooking({...newBooking, studentName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="text-xs text-gray-500 font-medium">المرحلة</label>
                  <select value={filterStage} onChange={(e) => { setFilterStage(e.target.value); setFilterYear(stageYears[e.target.value][0]); }} className="w-full border border-gray-300 rounded px-1 py-1.5 text-sm mt-1 focus:border-blue-600 focus:outline-none">
                    <option value="ابتدائي">ابتدائي</option><option value="إعدادي">إعدادي</option><option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">السنة</label>
                  <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full border border-gray-300 rounded px-1 py-1.5 text-sm mt-1 focus:border-blue-600 focus:outline-none">
                    {stageYears[filterStage]?.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">المادة</label>
                  <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="w-full border border-gray-300 rounded px-1 py-1.5 text-sm mt-1 focus:border-blue-600 focus:outline-none">
                    {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">اسم الكتاب <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="اكتب اسم الكتاب وسيتم اختياره أو إنشاؤه تلقائياً..." value={newBooking.bookName} onChange={(e) => setNewBooking({...newBooking, bookName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none" />
              </div>

              {!exactMatchBook && newBooking.bookName && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="col-span-2 text-xs font-bold text-blue-700">هذا الكتاب جديد، سيتم إضافته للمخزن تلقائياً:</div>
                  <div><label className="text-xs font-medium text-gray-700">سعر الطولي (ج.م)</label><input required type="number" min="0" value={newBooking.portraitPrice} onChange={(e) => setNewBooking({...newBooking, portraitPrice: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-600 focus:outline-none" /></div>
                  <div><label className="text-xs font-medium text-gray-700">سعر العرضي (ج.م)</label><input required type="number" min="0" value={newBooking.landscapePrice} onChange={(e) => setNewBooking({...newBooking, landscapePrice: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-600 focus:outline-none" /></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">الصيغة</label>
                  <select value={newBooking.format} onChange={(e) => setNewBooking({...newBooking, format: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none">
                    <option value={1}>طولي</option><option value={2}>عرضي</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">المدفوع (ج.م)</label>
                  <input required type="number" min="0" value={newBooking.paidAmount} onChange={(e) => setNewBooking({...newBooking, paidAmount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>

              {newBooking.bookName && (
                <div className="bg-gray-800 text-white p-3 rounded-lg text-sm font-bold flex justify-between">
                  <span>سعر الطباعة: {currentBookPrice} ج.م</span>
                  <span className="text-red-300">متبقي: {calculatedRemaining} ج.م</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">إلغاء</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">{isLoading ? 'جاري...' : 'تأكيد الحجز'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {paymentModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity">
          <form onSubmit={handleUpdatePayment} className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-gray-900">تحديث الدفعة المالية</h3>
            <label className="text-sm font-medium text-gray-700 mb-2 block">المبلغ (اكتب بالسالب للاسترجاع)</label>
            <input required type="number" value={paymentModalData.amount} onChange={e => setPaymentModalData({...paymentModalData, amount: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:border-blue-600 focus:outline-none" placeholder="مثال: 50 أو -20" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setPaymentModalData({isOpen: false, id:'', amount:''})} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">إلغاء</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50">حفظ الحركة</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}