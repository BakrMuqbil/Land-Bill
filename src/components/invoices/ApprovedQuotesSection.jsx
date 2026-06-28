import React from 'react';

export default function ApprovedQuotesSection({
  approvedQuotes,
  onConvert
}) {
  if (!approvedQuotes || approvedQuotes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        📋 عروض الأسعار المعمدة ({approvedQuotes.length})
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
              <th className="p-3.5">رقم العرض</th>
              <th className="p-3.5">العميل</th>
              <th className="p-3.5">الإجمالي</th>
              <th className="p-3.5">تاريخ التعميد</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-slate-50">
            {approvedQuotes.map((q) => {
              // 🔥 دعم كل من snake_case و camelCase
              const customerName = q.customer_name || q.customerName || '—';
              const grandTotal = q.grand_total || q.grandTotal || 0;
              const quoteNumber = q.quoteNumber || '—';
              const approvedAt = q.approved_at || q.approvedAt;

              return (
                <tr key={q.id} className="hover:bg-slate-50/40">
                  <td className="p-3.5 font-bold text-emerald-600 text-xs">
                    {quoteNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{customerName}</td>
                  <td className="p-3.5 text-[#059669] font-extrabold">
                    ${Number(grandTotal).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-slate-400 text-xs">
                    {approvedAt ? new Date(approvedAt).toLocaleDateString('ar-YE') : '—'}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onConvert(q)}
                      className="bg-[#059669] hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                    >
                      🔄 تحويل إلى فاتورة
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
