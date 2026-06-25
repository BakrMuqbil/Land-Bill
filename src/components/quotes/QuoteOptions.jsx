import React from 'react';

export default function QuoteOptions({
  includeWarranty,
  setIncludeWarranty,
  includeNote,
  setIncludeNote,
  customNoteText,
  setCustomNoteText
}) {
  return (
    <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
          <input
            type="checkbox"
            checked={includeWarranty}
            onChange={(e) => setIncludeWarranty(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <span>إدراج بند الضمانة المعتمد</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-bold text-sm select-none">
          <input
            type="checkbox"
            checked={includeNote}
            onChange={(e) => setIncludeNote(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <span>إضافة ملاحظة مخصصة أسفل الجدول</span>
        </label>
      </div>

      {includeNote && (
        <div className="pt-2">
          <textarea
            rows="2"
            value={customNoteText}
            onChange={(e) => setCustomNoteText(e.target.value)}
            placeholder="اكتب هنا الملاحظات الإضافية التي ترغب في أن تظهر بخط واضح أسفل جدول الـ PDF المستخرج..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
          />
        </div>
      )}
    </div>
  );
}
