'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import FadeIn from '@/components/fade-in';
import { useAuth } from '@/hooks/use-auth';
import { getBrowserSupabase } from '@/lib/supabase';

const FYLKER = [
  'Østfold',
  'Akershus',
  'Oslo',
  'Innlandet',
  'Buskerud',
  'Vestfold',
  'Telemark',
  'Agder',
  'Rogaland',
  'Vestland',
  'Møre og Romsdal',
  'Trøndelag',
  'Nordland',
  'Troms',
  'Finnmark',
];

const KATEGORIER = [
  'Helse og omsorg',
  'Energi og miljø',
  'Utdanning og forskning',
  'Transport og infrastruktur',
  'Næring og arbeid',
  'Justis og beredskap',
  'Finans og økonomi',
  'Forsvar og sikkerhet',
  'Kultur og likestilling',
  'Utenriks og bistand',
  'Kommunal og distrikt',
  'Familie og oppvekst',
];

export default function OnboardingPage() {
  const [fylke, setFylke] = useState('');
  const [telefon, setTelefon] = useState('');
  const [selectedKategorier, setSelectedKategorier] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useAuth();

  const toggleKategori = (kategori: string) => {
    setSelectedKategorier(prev =>
      prev.includes(kategori)
        ? prev.filter(k => k !== kategori)
        : [...prev, kategori]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fylke) {
      setError('Vennligst velg fylke.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const supabase = getBrowserSupabase();
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          fylke,
          telefon: telefon || null,
          hjertesaker: selectedKategorier,
          onboarding_completed: true,
        },
      });

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }

      router.push('/min-side');
      router.refresh();
    } catch {
      setError('En feil oppstod. Prøv igjen.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Laster...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <FadeIn delay={0.1}>
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Velkommen, {user.user_metadata?.full_name?.split(' ')[0] || 'bruker'}!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Fortell oss litt om deg slik at vi kan tilpasse opplevelsen din.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-3xl sm:px-10 border border-gray-100">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Fylke */}
              <div>
                <label htmlFor="fylke" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                  Hvilket fylke bor du i? <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="fylke"
                  value={fylke}
                  onChange={(e) => setFylke(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none"
                >
                  <option value="">Velg fylke...</option>
                  {FYLKER.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Brukes til å vise lokalt engasjement og koble deg med din representant.
                </p>
              </div>

              {/* Telefonnummer */}
              <div>
                <label htmlFor="telefon" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                  Telefonnummer <span className="text-gray-400 text-xs ml-1">(valgfritt)</span>
                </label>
                <input
                  id="telefon"
                  type="tel"
                  placeholder="+47 XXX XX XXX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  For fremtidig identitetsverifisering og varsler. Lagres kryptert.
                </p>
              </div>

              {/* Hjertesaker */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-900 mb-3">
                  <Heart className="w-4 h-4 mr-2 text-indigo-600" />
                  Hvilke saksområder bryr du deg mest om?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {KATEGORIER.map(kategori => {
                    const isSelected = selectedKategorier.includes(kategori);
                    return (
                      <button
                        key={kategori}
                        type="button"
                        onClick={() => toggleKategori(kategori)}
                        className={`relative flex items-center px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                        )}
                        <span className={isSelected ? '' : 'ml-6'}>{kategori}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Velg én eller flere. Du kan endre dette når som helst under &quot;Mine hjertesaker&quot;.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Lagrer...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Kom i gang
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { router.push('/min-side'); router.refresh(); }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Hopp over for nå
              </button>
            </form>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
