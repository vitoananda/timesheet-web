'use client';

import React, { useState } from 'react';

interface MetrodataLogoProps {
  className?: string;
}

export const MetrodataLogo: React.FC<MetrodataLogoProps> = ({ className = "h-11 w-auto" }) => {
  const [imgError, setImgError] = useState(false);

  // If logo.png exists in /images/logo.png, display the user's uploaded file.
  // Otherwise, automatically render the built-in SVG vector replica.
  if (!imgError) {
    return (
      <div className={`flex items-center justify-end select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Company Logo"
          className="max-h-12 max-w-[140px] object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Metrodata distinctive M logo: teal left curve, blue right curve, orange dots/swoosh */}
      <svg viewBox="0 0 100 70" className="w-16 h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 18 60 L 18 18 C 18 10 28 10 32 18 L 48 48 C 50 51 54 51 56 48 L 72 18 C 76 10 86 10 86 18 L 86 60"
          stroke="url(#metroGradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="52" cy="14" r="5" fill="#f97316" />
        <defs>
          <linearGradient id="metroGradient" x1="18" y1="60" x2="86" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284c7" />
            <stop offset="0.5" stopColor="#0d9488" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[7px] font-extrabold tracking-widest text-[#00607f] uppercase font-sans mt-0.5">
        METRODATA
      </span>
    </div>
  );
};
