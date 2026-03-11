'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { mockIssues } from '@/lib/data';
import Link from 'next/link';

const mockDemographics = [
  { name: '18-29', for: 4000, mot: 2400 },
  { name: '30-49', for: 3000, mot: 3900 },
  { name: '50-64', for: 2000, mot: 4800 },
  { name: '65+', for: 1500, mot: 3800 },
];

const COLORS = ['#10b981', '#f43f5e', '#6b7280'];

export default function PolitikerHubPage() {
  const [isVerified, setIsVerified] = useState(true); // Mocking logged in state

  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Politiker-verifisering</h2>
        <p className="text-gray-600 mb-8">Logg inn med din @stortinget.no e-post for å få tilgang til innsikt og statistikk for ditt distrikt.</p>
        <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Logg inn via Stortinget
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold mr-4">
            ON
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ola Nordmann</h1>
            <p className="text-gray-500 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" />
              Verifisert Representant (Hordaland)
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-indigo-600">45 210</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Aktive brukere i ditt fylke</div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Specific Issue Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Innsikt: Fastlegeordningen</h2>
              <select className="text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                <option>Velg sak...</option>
                <option>Fastlegeordningen</option>
                <option>Havvind</option>
              </select>
            </div>
            
            <p className="text-gray-600 mb-8">
              Slik stemmer innbyggerne i <strong>Hordaland</strong> på forslaget om å styrke fastlegeordningen.
            </p>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockDemographics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="for" name="For" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mot" name="Mot" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                AI-Analyse av trenden
              </h3>
              <p className="text-indigo-800">
                Det er en tydelig generasjonskløft i ditt distrikt. Yngre velgere (under 50) er overveiende positive til forslaget, mens eldre velgere er mer skeptiske. Dette kan tyde på at bekymringen for kostnader veier tyngre hos de eldre.
              </p>
            </div>
          </div>

          {/* Direct Response Feature */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
              Publiser ditt svar
            </h2>
            <p className="text-gray-600 mb-4">
              Forklar velgerne hvorfor du stemte som du gjorde, eller hva partiet ditt mener om saken. Dette vil vises øverst for alle brukere fra Hordaland som ser på denne saken.
            </p>
            <textarea 
              rows={4} 
              className="w-full border border-gray-300 rounded-xl p-4 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder="Skriv din kommentar her..."
            ></textarea>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Publiser offisielt svar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats & Alerts */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mest engasjerende saker</h3>
            <p className="text-sm text-gray-500 mb-4">Saker med flest unike stemmer fra Hordaland.</p>
            <div className="space-y-3">
              {mockIssues.slice(0, 3).map((issue, index) => (
                <Link href={`/sak/${issue.id}`} key={issue.id} className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-indigo-600 line-clamp-2 pr-4">{issue.title}</span>
                    <span className="text-sm font-bold text-gray-400 whitespace-nowrap">#{index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[120px]">{issue.category}</span>
                    <span className="flex items-center whitespace-nowrap"><Users className="w-3 h-3 mr-1"/> {Math.floor(issue.votes.total * 0.12).toLocaleString('no-NO')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Engasjement per kategori</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Helse og omsorg</span>
                </div>
                <span className="text-sm font-bold text-gray-900">34%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Energi og miljø</span>
                </div>
                <span className="text-sm font-bold text-gray-900">28%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Samferdsel</span>
                </div>
                <span className="text-sm font-bold text-gray-900">22%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
              Avviksvarsler
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Saker der flertallet i ditt fylke mener noe annet enn partiets offisielle linje:
            </p>
            <ul className="space-y-3">
              <li className="p-3 border border-rose-100 bg-rose-50 rounded-lg">
                <p className="text-sm font-medium text-rose-900">Utbygging av havvind</p>
                <p className="text-xs text-rose-700 mt-1">65% av velgerne i Hordaland er mot, partiet er for.</p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
