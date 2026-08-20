import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const navLinks = [
    { name: 'لوحة القيادة', path: '/dashboard' },
    { name: 'إدارة الكتب', path: '/books' },
    { name: 'الحجوزات والطلبات', path: '/bookings' },
    { name: 'الإعدادات', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900" dir="rtl">
      
      <aside className="w-64 border-l border-gray-200 bg-white shadow-sm flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-700">مكتبة العمدة</h1>
            <p className="text-xs text-gray-500">لوحة تحكم الإدارة</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link to="/login" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        
        <header className="flex h-20 items-center justify-end border-b border-gray-200 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-4 cursor-default">
            <span className="text-sm font-bold text-gray-700">مرحباً بعودتك يا عمدة 👋</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100 shadow-sm overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600 mt-2">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}