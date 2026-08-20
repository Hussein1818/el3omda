import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: username,
        password: password
      });

      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }

      navigate('/dashboard');
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة.');
      } else {
        setErrorMsg('حدث خطأ في الاتصال بالخادم، تأكد من تشغيل الباك إند.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-cairo" dir="rtl">
      
      {/* Right Side - Form Section */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 shadow-[0_0_40px_rgba(0,0,0,0.05)] z-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          
          {/* Header Section - Centered */}
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#0F172A]">مكتبة العمدة</h1>
            <p className="mt-2 text-sm text-[#64748B]">مرحباً بك! يرجى تسجيل الدخول للوصول إلى لوحة التحكم.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626] border border-[#FECACA]">
                {errorMsg}
              </div>
            )}
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#334155]">اسم المستخدم</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border border-[#E2E8F0] px-4 py-3.5 text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-[#334155]">كلمة المرور</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-[#E2E8F0] px-4 py-3.5 text-[#0F172A] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-[42px] text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-xl bg-[#2563EB] px-4 py-3.5 text-center text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>
          
        </div>
      </div>

      {/* Left Side - Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50/40 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl"></div>
        
        <div className="relative z-10 p-12 w-full max-w-2xl text-center transition-transform duration-700 hover:scale-[1.02]">
          <img 
            src="/login-illustration.svg" 
            alt="Library Management Illustration" 
            className="w-full h-auto drop-shadow-xl"
          />
        </div>
      </div>

    </div>
  );
}