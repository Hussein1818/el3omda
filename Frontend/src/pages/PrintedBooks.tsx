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

interface PrintedBook {
  id: string;
  name: string;
  subject: string;
  stage: number;
  year: number;
  totalPortraitStock: number;
  reservedPortraitStock: number;
  freePortraitStock: number;
  totalLandscapeStock: number;
  reservedLandscapeStock: number;
  freeLandscapeStock: number;
}

export default function PrintedBooks() {
  const [inventory, setInventory] = useState<PrintedBook[]>([]);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [filterStage, setFilterStage] = useState('ابتدائي');
  const [filterYear, setFilterYear] = useState('الصف الأول');
  const [filterSubject, setFilterSubject] = useState(subjectsList[0]);

  const [formData, setFormData] = useState({
    bookName: '',
    format: 1,
    quantity: 1,
    isAddition: true,
    portraitPrice: '',
    landscapePrice: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchAllBooks();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/books/printed-inventory');
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const response = await api.get('/books');
      setAvailableBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch all books", error);
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
    b.name.trim().toLowerCase() === formData.bookName.trim().toLowerCase()
  );

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      let bookIdToUse = exactMatchBook?.id;

      if (!bookIdToUse) {
        if (!formData.isAddition) {
          setErrorMsg('لا يمكن خصم مخزون من كتاب غير مسجل في النظام!');
          setIsLoading(false);
          return;
        }

        const bookResponse = await api.post('/books', {
          name: formData.bookName,
          subject: filterSubject,
          stage: stageMap[filterStage],
          year: yearMap[filterYear],
          portraitPrice: parseFloat(formData.portraitPrice) || 0,
          landscapePrice: parseFloat(formData.landscapePrice) || 0
        });
        bookIdToUse = bookResponse.data.bookId;
        await fetchAllBooks(); 
      }

      await api.post('/books/adjust-inventory', {
        bookId: bookIdToUse,
        format: formData.format,
        quantity: formData.quantity,
        isAddition: formData.isAddition
      });

      await fetchInventory();
      setIsModalOpen(false);
      setFormData({ bookName: '', format: 1, quantity: 1, isAddition: true, portraitPrice: '', landscapePrice: '' });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'حدث خطأ أثناء تعديل المخزون.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDeduct = async (bookId: string, format: number) => {
    if (!window.confirm('هل أنت متأكد من خصم نسخة واحدة من هذا الكتاب؟')) return;
    try {
      await api.post('/books/adjust-inventory', {
        bookId,
        format,
        quantity: 1,
        isAddition: false
      });
      fetchInventory();
    } catch (error) {
      alert('حدث خطأ أثناء خصم النسخة.');
    }
  };

  const getStageString = (s: number) => s === 1 ? 'ابتدائي' : s === 2 ? 'إعدادي' : 'ثانوي';
  const getYearString = (y: number) => ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'][y - 1] || '';

  const getStageColorClass = (s: number) => {
    if (s === 1) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s === 3) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredInventory = inventory.filter(b => 
    normalizeArabic(b.name).includes(normalizeArabic(searchTerm)) || 
    normalizeArabic(b.subject).includes(normalizeArabic(searchTerm))
  );

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المخزون المطبوع</h2>
          <p className="mt-1 text-sm text-gray-500">إدارة الكتب الجاهزة على الأرفف لتسليمها للطلاب.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ابحث باسم الكتاب أو المادة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-600 focus:outline-none min-w-[250px]"
          />
          <button onClick={() => { setIsModalOpen(true); setErrorMsg(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            إضافة للمخزون (+)
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1 h-[calc(100vh-200px)]">
          <table className="w-full text-right text-sm text-gray-500 relative">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0 z-10 shadow-sm">
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
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{book.name}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{book.subject}</td>
                    <td className="px-6 py-4 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded-full border ${getStageColorClass(book.stage)}`}>
                            {getStageString(book.stage)}
                        </span>
                        <span className="text-gray-500 block mt-1">الصف {getYearString(book.year)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">كلي: {book.totalPortraitStock}</span>
                            <button 
                            onClick={() => handleQuickDeduct(book.id, 1)}
                            disabled={book.totalPortraitStock <= 0}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-30"
                            title="خصم نسخة"
                            >
                            ➖
                            </button>
                        </div>
                        <div className="flex gap-2 text-[10px] mt-1">
                            <span className="text-green-700 bg-green-50 px-1.5 rounded font-bold border border-green-200">حر: {book.freePortraitStock}</span>
                            <span className="text-amber-700 bg-amber-50 px-1.5 rounded font-bold border border-amber-200">محجوز: {book.reservedPortraitStock}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold">كلي: {book.totalLandscapeStock}</span>
                            <button 
                            onClick={() => handleQuickDeduct(book.id, 2)}
                            disabled={book.totalLandscapeStock <= 0}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-30"
                            title="خصم نسخة"
                            >
                            ➖
                            </button>
                        </div>
                        <div className="flex gap-2 text-[10px] mt-1">
                            <span className="text-green-700 bg-green-50 px-1.5 rounded font-bold border border-green-200">حر: {book.freeLandscapeStock}</span>
                            <span className="text-amber-700 bg-amber-50 px-1.5 rounded font-bold border border-amber-200">محجوز: {book.reservedLandscapeStock}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">لا يوجد كتب في المخزون تطابق بحثك.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">تعديل المخزون اليدوي</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAdjustInventory} className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm bg-red-50 p-3 rounded font-medium border border-red-200">{errorMsg}</div>}
              
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" checked={formData.isAddition} onChange={() => setFormData({...formData, isAddition: true})} className="text-blue-600" />
                  <span className={formData.isAddition ? "text-green-700 font-bold" : "text-gray-600"}>إضافة للمخزون (+)</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="radio" checked={!formData.isAddition} onChange={() => setFormData({...formData, isAddition: false})} className="text-red-600" />
                  <span className={!formData.isAddition ? "text-red-700 font-bold" : "text-gray-600"}>خصم من المخزون (-)</span>
                </label>
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
                <input required type="text" placeholder="اكتب اسم الكتاب وسيتم اختياره أو إنشاؤه تلقائياً..." value={formData.bookName} onChange={(e) => setFormData({...formData, bookName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none" />
              </div>

              {!exactMatchBook && formData.bookName && formData.isAddition && (
                <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="col-span-2 text-xs font-bold text-blue-700">هذا الكتاب جديد، يرجى إدخال أسعار الطباعة الخاصة به:</div>
                  <div><label className="text-xs font-medium text-gray-700">سعر الطولي (ج.م)</label><input required type="number" min="0" value={formData.portraitPrice} onChange={(e) => setFormData({...formData, portraitPrice: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-600 focus:outline-none" /></div>
                  <div><label className="text-xs font-medium text-gray-700">سعر العرضي (ج.م)</label><input required type="number" min="0" value={formData.landscapePrice} onChange={(e) => setFormData({...formData, landscapePrice: e.target.value})} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-600 focus:outline-none" /></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">الصيغة</label>
                  <select value={formData.format} onChange={(e) => setFormData({...formData, format: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none">
                    <option value={1}>طولي</option><option value={2}>عرضي</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">الكمية</label>
                  <input required type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">إلغاء</button>
                <button type="submit" disabled={isLoading} className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${formData.isAddition ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isLoading ? 'جاري التنفيذ...' : (formData.isAddition ? 'إضافة للمخزون' : 'خصم من المخزون')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}