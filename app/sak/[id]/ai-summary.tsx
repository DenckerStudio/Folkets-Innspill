'use client';

import { ShieldCheck, BrainCircuit, Users, Coins, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function AiSummary({ title, summary }: { title: string, summary: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ hva: string, hvem: string, kostnad: string } | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Du er en nøytral, lokal AI-assistent (Ollama) for "Folkets Stemme". 
Din oppgave er å forenkle følgende stortingssak for vanlige borgere.
Sakstittel: ${title}
Beskrivelse: ${summary}

Svar KUN med et JSON-objekt med følgende nøkler:
"hva": Kort forklart, hva handler saken om? (maks 2 setninger)
"hvem": Hvem påvirkes direkte av dette? (maks 2 setninger)
"kostnad": Hva er den antatte økonomiske kostnaden eller konsekvensen? (maks 2 setninger)
Svar på norsk.`,
          config: {
            responseMimeType: 'application/json',
          }
        });
        
        let responseText = response.text || '{}';
        // Remove markdown formatting if present
        if (responseText.startsWith('```json')) {
          responseText = responseText.replace(/```json\n?/, '').replace(/```$/, '');
        } else if (responseText.startsWith('```')) {
          responseText = responseText.replace(/```\n?/, '').replace(/```$/, '');
        }
        
        const json = JSON.parse(responseText);
        setData(json);
      } catch (error) {
        console.error('Failed to generate summary', error);
        setData({
          hva: 'Kunne ikke generere sammendrag for øyeblikket.',
          hvem: 'Ukjent',
          kostnad: 'Ukjent'
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [title, summary]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Kort forklart av AI</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lokal AI (Norge) - 100% Personvern</span>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center text-indigo-600 font-medium mb-2">
                <Info className="w-4 h-4 mr-2" />
                Hva er saken?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.hva}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-amber-600 font-medium mb-2">
                <Users className="w-4 h-4 mr-2" />
                Hvem påvirkes?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.hvem}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-emerald-600 font-medium mb-2">
                <Coins className="w-4 h-4 mr-2" />
                Hva er kostnaden?
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{data?.kostnad}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
