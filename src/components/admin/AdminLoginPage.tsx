import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff, Info } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await onLogin(email, password);
      if (!res.success) {
        setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Home link */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับสู่หน้าเว็บไซต์หลัก</span>
      </button>

      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand & Heading */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Coway Admin Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            เข้าสู่ระบบผู้ดูแลหลังบ้าน
          </h1>
          <p className="text-xs text-slate-500">
            ยืนยันตัวตนด้วยบัญชี Supabase Auth สำหรับจัดการข้อมูลเว็บไซต์
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              อีเมลผู้ดูแลระบบ (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-sky-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ (Sign In)</span>
            )}
          </button>
        </form>

        {/* Supabase Auth Helper Box */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>คำแนะนำ: วิธีสร้างบัญชี Admin ใน Supabase</span>
          </button>

          {showHelper && (
            <div className="mt-3 p-3 bg-sky-50 rounded-2xl text-left text-[11px] text-sky-900/90 leading-relaxed border border-sky-100 animate-in fade-in">
              <p className="font-semibold mb-1">ขั้นตอนการสร้างบัญชีผู้ดูแล:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>ไปที่ <strong>Supabase Dashboard</strong> ของโปรเจกต์คุณ</li>
                <li>เมนูด้านซ้ายเลือก <strong>Authentication</strong> &gt; <strong>Users</strong></li>
                <li>คลิกปุ่ม <strong>Add user</strong> &gt; เลือก <strong>Create user</strong></li>
                <li>กรอก <strong>Email</strong> และ <strong>Password</strong> สำหรับใช้ล็อกอิน</li>
                <li>ติ๊กถูกที่ <strong>Auto Confirm User</strong> แล้วกด Save</li>
              </ol>
            </div>
          )}
        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        ระบบป้องกันความปลอดภัยด้วย Supabase Row Level Security (RLS)
      </div>
    </div>
  );
};
