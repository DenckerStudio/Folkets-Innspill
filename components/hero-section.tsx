'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

function DrawSVGIcon() {
  return (
    <svg viewBox="0 0 200 250" className="w-20 h-24 sm:w-28 sm:h-32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="hero-bubble">
          <path d="M 40 0 H 160 A 40 40 0 0 1 200 40 V 160 A 40 40 0 0 1 160 200 H 140 L 145 240 L 100 200 H 40 A 40 40 0 0 1 0 160 V 40 A 40 40 0 0 1 40 0 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#hero-bubble)">
        <rect width="200" height="250" fill="#ba0c2f" />
        <rect x="60" y="0" width="30" height="250" fill="white" />
        <rect x="0" y="80" width="200" height="30" fill="white" />
        <rect x="70" y="0" width="10" height="250" fill="#00205b" />
        <rect x="0" y="90" width="200" height="10" fill="#00205b" />
        <path d="M 0 150 L 90 60 L 120 90 L 220 -10 L 220 250 L 0 250 Z" fill="#ba0c2f" />
      </g>
      <g clipPath="url(#hero-bubble)">
        <motion.path
          d="M -10 160 L 90 60 L 120 90 L 230 -20"
          fill="none"
          stroke="white"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.5, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="120"
          cy="90"
          r="14"
          fill="#00205b"
          stroke="white"
          strokeWidth="6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.8, type: 'spring', bounce: 0.5 }}
        />
      </g>
    </svg>
  );
}

function AnimatedGradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(186,12,47,0.15) 0%, transparent 70%)',
          top: '-10%',
          left: '10%',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,32,91,0.12) 0%, transparent 70%)',
          bottom: '-15%',
          right: '5%',
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 30, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function GridPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: `${15 + i * 15}%`,
    y: `${20 + (i % 3) * 25}%`,
    size: 3 + (i % 3) * 2,
    delay: i * 0.7,
    duration: 6 + (i % 3) * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-400/20"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <motion.section
      ref={ref}
      className="relative overflow-hidden text-center py-24 sm:py-36 w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] -mt-8 mb-12 bg-gray-50"
    >
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <AnimatedGradientOrbs />
        <GridPattern />
        <FloatingParticles />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity: contentOpacity, y: contentY, scale }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center mb-8"
        >
          <DrawSVGIcon />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center px-4 py-1.5 bg-white/80 backdrop-blur-sm text-indigo-700 text-sm font-medium mb-8 border border-indigo-100/50 rounded-full shadow-sm"
        >
          <motion.span
            className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2.5"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Demokratiet fortsetter mellom valgene
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6"
          >
            <motion.span
              className="block mb-2"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Din stemme teller.
            </motion.span>
            <motion.span
              className="block"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-transparent bg-clip-text bg-[length:200%_200%] animate-[gradient-shift_6s_ease_infinite] bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600">
                Også mellom valgene.
              </span>
            </motion.span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl leading-relaxed"
        >
          Folkets Stemme er en nøytral plattform som brobygger mellom Stortinget og innbyggerne.
          Si din mening om aktuelle saker med verifisert stemmegivning.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 max-w-md mx-auto sm:flex sm:justify-center gap-4"
        >
          <Link href="/utforsk" className="group w-full sm:w-auto relative flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all duration-300 md:text-lg shadow-lg hover:shadow-xl rounded-xl overflow-hidden">
            <span className="relative z-10">Utforsk saker</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </Link>
          <Link href="/auth/login" className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-gray-200 text-base font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-gray-300 transition-all duration-300 md:text-lg shadow-sm hover:shadow rounded-xl">
            Logg inn
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 inline-flex items-start text-left bg-white/70 backdrop-blur-sm border border-gray-200/50 p-5 max-w-2xl mx-auto shadow-sm rounded-2xl"
        >
          <Info className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-900">Uavhengig plattform:</strong> Vi samarbeider ikke med Regjeringen eller Stortinget. Dette er et uavhengig initiativ for å styrke demokratiet. Vårt håp er at politikerne på sikt vil ta i bruk dataene og lytte til folket her inne.
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
