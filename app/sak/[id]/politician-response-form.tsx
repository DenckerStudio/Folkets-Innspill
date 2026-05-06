'use client';

import { useState } from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function PoliticianResponseForm() {
  const [isVerifiedPolitician, setIsVerifiedPolitician] = useState(true); // Mocked state
  const [response, setResponse] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  if (!isVerifiedPolitician) return null;

  if (isPublished) {
    return (
      <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6 mb-8">
        <div className="flex items-center text-emerald-800 font-medium mb-2">
          <ShieldCheck className="w-5 h-5 mr-2" />
          Ditt offisielle svar er publisert
        </div>
        <p className="text-emerald-700 text-sm">
          Svaret ditt er nå synlig for velgerne og bidrar til en mer opplyst debatt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
        Publiser ditt offisielle svar
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Som verifisert politiker kan du forklare din eller ditt partis stilling til denne saken. Svaret vil bli fremhevet med et verifiseringsmerke.
      </p>
      <textarea 
        rows={4} 
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="w-full border border-gray-300 rounded-xl p-4 focus:ring-indigo-500 focus:border-indigo-500 mb-4 text-sm"
        placeholder="Skriv din forklaring her..."
      ></textarea>
      <div className="flex justify-end">
        <button 
          onClick={() => setIsPublished(true)}
          disabled={!response.trim()}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Publiser svar
        </button>
      </div>
    </div>
  );
}
