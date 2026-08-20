import { useState } from 'react';
import { api } from '../lib/axios';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة غير متطابقة مع حقل التأكيد.');
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/settings/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword
      });

      setSuccessMsg('تم تغيير كلمة المرور بنجاح!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      let errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور.';
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(' | ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الإعدادات</h2>
          <p className="mt-1 text-sm text-gray-500">تعديل إعدادات النظام وحسابات المستخدمين.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-2xl">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h3 className="font-semibold text-gray-800">تغيير كلمة المرور الخاصة بالمدير</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-200">
              {successMsg}
            </div>
          )}

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-gray-700">كلمة المرور الحالية <span className="text-red-500">*</span></label>
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-4 top-[40px] text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                {showCurrent ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-gray-700">كلمة المرور الجديدة <span className="text-red-500">*</span></label>
            <input
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-4 top-[40px] text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                {showNew ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span></label>
            <input
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}