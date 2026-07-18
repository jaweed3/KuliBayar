export default function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 bg-[#050505] relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="w-full md:w-auto">
            <h2 className="text-[10vw] leading-[0.8] tracking-tighter text-white/5 font-bold select-none pointer-events-none uppercase">
              KuliBayar.
            </h2>
          </div>

          <div className="flex flex-col gap-8 md:text-right">
            <div className="flex flex-col md:flex-row gap-8 text-gray-400 uppercase tracking-widest text-xs">
              <a href="#" className="hover:text-[#FF4500] transition-colors">Whitepaper</a>
              <a href="https://github.com/jaweed3/KuliBayar" className="hover:text-[#FF4500] transition-colors">GitHub</a>
              <a href="#" className="hover:text-[#FF4500] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#FF4500] transition-colors">Dokumentasi</a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">© 2026 KuliBayar. Built for the infrastructure of Indonesia.</p>
              <p className="text-[10px] text-gray-800 uppercase tracking-widest font-mono">Jakarta, 06.1824° S, 106.8291° E</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
