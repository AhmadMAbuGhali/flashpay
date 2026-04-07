"use client";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#6a7eaa] flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      
      {/* تأثيرات الإضاءة الخلفية الطبقية */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full flex flex-col items-center relative z-10">
        
        {/* 1. الشعار بتصميم عائم */}
        <div className="relative mb-10 animate-fade-up">
          <div className="absolute inset-0 bg-white/20 blur-[50px] rounded-full" />
          <div className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[4rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Flash Pay Logo" 
              width={220} 
              height={220} 
              className="rounded-[3rem] object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* 2. النصوص الرئيسية */}
        <div className="text-center mb-12 space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
            قريباً <span className="text-[#00D2FF]">Flash Pay</span>
          </h1>
          <p className="text-xl md:text-3xl font-medium text-white/80 tracking-[0.2em] uppercase italic">
            نظام الحوالات المالية الأسرع
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent mx-auto rounded-full shadow-[0_0_15px_#00D2FF]" />
        </div>

        {/* 3. إطار الفيديو السينمائي (تمت إزالة شريط الحالة منه) */}
        <div className="w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden border-[12px] border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] bg-black/40 relative mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* تظليل سفلي خفيف لإعطاء جمالية للفيديو */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 4. قسم التواصل الاجتماعي */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-xl animate-fade-up text-center" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-white/90 text-lg md:text-xl font-bold mb-6 tracking-widest uppercase">
            تواصل معنا حالياً عبر
          </h2>
          
          <div className="flex flex-wrap justify-center gap-5">
            {/* فيسبوك */}
            <a href="https://www.facebook.com/share/18W65sncNE/" target="_blank" className="group flex flex-col items-center gap-2">
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[#1877F2] group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Facebook</span>
            </a>

            {/* واتساب */}
            <a href="https://wa.me/447704837539" target="_blank" className="group flex flex-col items-center gap-2">
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[#25D366] group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">WhatsApp</span>
            </a>

            {/* تليجرام */}
            <a href="https://t.me/+447704837539" target="_blank" className="group flex flex-col items-center gap-2">
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-[#0088cc] group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.206 8.358l-1.764 8.306c-.134.589-.483.732-.978.457l-2.69-1.983-1.297 1.25c-.144.144-.264.264-.534.264l.192-2.738 4.985-4.503c.217-.193-.047-.3-.332-.112l-6.16 3.882-2.652-.828c-.577-.181-.59-.577.121-.855l10.362-3.995c.48-.177.9.11.745.85z"/></svg>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Telegram</span>
            </a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-20 text-[9px] font-black uppercase tracking-[1em] text-white/20">
        Flash Pay • Trusted Solutions • 2026
      </footer>
    </main>
  );
}