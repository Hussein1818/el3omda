import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

const stageYears: Record<string, string[]> = {
  'ابتدائي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
  'إعدادي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
  'ثانوي': ['الصف الأول', 'الصف الثاني', 'الصف الثالث'],
};

const subjectsList = [
  'اللغة العربية',
  'اللغة الإنجليزية',
  'اللغة الفرنسية',
  'اللغة الألمانية',
  'الرياضيات',
  'العلوم',
  'الدراسات الاجتماعية',
  'الفيزياء',
  'الكيمياء',
  'الأحياء',
  'التاريخ',
  'الجغرافيا',
  'علم النفس والاجتماع',
  'الفلسفة والمنطق',
  'الجبر والهندسة الفراغية',
  'التفاضل والتكامل',
  'الاستاتيكا',
  'الديناميكا',
  'تكنولوجيا المعلومات (ICT)',
  'المهارات المهنية'
];

interface Book {
  id: string;
  name: string;
  subject: string;
  stage: number | string;
  year: number | string;
  portraitPrice: number;
  landscapePrice: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: subjectsList[0],
    stage: 'ابتدائي',
    year: 'الصف الأول',
    portraitPrice: '',
    landscapePrice: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books", error);
    }
  };

  const getStageString = (stageValue: number | string) => {
    if (typeof stageValue === 'string') return stageValue;
    if (stageValue === 1) return 'ابتدائي';
    if (stageValue === 2) return 'إعدادي';
    return 'ثانوي';
  };

  const getStageColorClass = (stageValue: number | string) => {
    const stage = getStageString(stageValue);
    if (stage === 'ابتدائي') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (stage === 'إعدادي') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (stage === 'ثانوي') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getYearString = (yearValue: number | string) => {
    if (typeof yearValue === 'string') return yearValue;
    const years = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];
    return years[yearValue - 1] || 'الصف الأول';
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStage = e.target.value;
    setFormData({ ...formData, stage: selectedStage, year: stageYears[selectedStage][0] });
  };

  const openAddModal = () => {
    setEditingBookId(null);
    setFormData({
      name: '',
      subject: subjectsList[0],
      stage: 'ابتدائي',
      year: 'الصف الأول',
      portraitPrice: '',
      landscapePrice: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      name: book.name,
      subject: book.subject,
      stage: getStageString(book.stage),
      year: getYearString(book.year),
      portraitPrice: book.portraitPrice.toString(),
      landscapePrice: book.landscapePrice.toString()
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      await api.delete(`/books/${id}`);
      await fetchBooks();
    } catch (error) {
      console.error("Failed to delete book", error);
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const stageMap: Record<string, number> = { 'ابتدائي': 1, 'إعدادي': 2, 'ثانوي': 3 };
      const yearMap: Record<string, number> = { 
        'الصف الأول': 1, 'الصف الثاني': 2, 'الصف الثالث': 3, 
        'الصف الرابع': 4, 'الصف الخامس': 5, 'الصف السادس': 6 
      };

      const payload = {
        name: formData.name,
        subject: formData.subject,
        stage: stageMap[formData.stage],
        year: yearMap[formData.year],
        portraitPrice: parseFloat(formData.portraitPrice) || 0,
        landscapePrice: parseFloat(formData.landscapePrice) || 0
      };

      if (editingBookId) {
        await api.put(`/books/${editingBookId}`, payload);
      } else {
        await api.post('/books', payload);
      }

      await fetchBooks();
      setIsModalOpen(false);
    } catch (error: any) {
      let errorMessage = 'Failed to process request. Please verify your connection.';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(' | ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(b => 
    b.name.includes(searchTerm) || b.subject.includes(searchTerm)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الكتب</h2>
          <p className="mt-1 text-sm text-gray-500">إدارة المخزون، المواد الدراسية، وأسعار الطباعة.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="ابحث باسم الكتاب أو المادة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إضافة كتاب جديد
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">اسم الكتاب</th>
                <th scope="col" className="px-6 py-4">المادة</th>
                <th scope="col" className="px-6 py-4">المرحلة الدراسية</th>
                <th scope="col" className="px-6 py-4">السنة الدراسية</th>
                <th scope="col" className="px-6 py-4">السعر الطولي</th>
                <th scope="col" className="px-6 py-4">السعر العرضي</th>
                <th scope="col" className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map((book) => {
                 const stageDisplay = getStageString(book.stage);
                 const yearDisplay = getYearString(book.year);

                return (
                  <tr key={book.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{book.name}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{book.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStageColorClass(book.stage)}`}>
                        {stageDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{yearDisplay}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{book.portraitPrice} ج.م</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{book.landscapePrice} ج.م</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(book)}
                          className="font-medium text-blue-600 transition-colors hover:text-blue-800"
                        >
                          تعديل
                        </button>
                        <span className="text-gray-300">|</span>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="font-medium text-red-600 transition-colors hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">لا توجد كتب مسجلة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBookId ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">اسم السلسلة / الكتاب <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="مثال: سلاح التلميذ"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المادة الدراسية <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {subjectsList.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">المرحلة الدراسية</label>
                  <select
                    value={formData.stage}
                    onChange={handleStageChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="ابتدائي">ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">السنة الدراسية</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {stageYears[formData.stage].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">السعر الطولي (ج.م) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.portraitPrice}
                    onChange={(e) => setFormData({...formData, portraitPrice: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">السعر العرضي (ج.م) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.landscapePrice}
                    onChange={(e) => setFormData({...formData, landscapePrice: e.target.value})}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}