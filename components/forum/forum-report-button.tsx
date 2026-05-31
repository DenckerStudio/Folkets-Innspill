'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

type ForumReportButtonProps = {
  targetType: 'thread' | 'reply';
  targetId: string;
};

export function ForumReportButton({ targetType, targetId }: ForumReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async () => {
    setStatus('sending');
    const res = await fetch('/api/forum/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
    });
    if (!res.ok) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    setOpen(false);
    setReason('');
  };

  if (status === 'sent') {
    return <span className="text-xs text-emerald-600">Rapport sendt</span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600"
      >
        <Flag className="w-3.5 h-3.5" />
        Rapporter
      </button>
      {open && (
        <div className="absolute z-10 right-0 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Beskriv problemet (valgfritt)"
            className="w-full text-xs border border-gray-200 rounded-md p-2"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="text-xs text-gray-500"
              onClick={() => setOpen(false)}
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={status === 'sending'}
              className="text-xs font-medium text-white bg-rose-600 px-2 py-1 rounded"
            >
              Send
            </button>
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-600 mt-1">Kunne ikke sende. Logg inn og prøv igjen.</p>
          )}
        </div>
      )}
    </div>
  );
}
