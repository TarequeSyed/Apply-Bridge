import React from 'react';

interface ApplyBridgeLogoProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
}

export const ApplyBridgeLogo: React.FC<ApplyBridgeLogoProps> = ({
  size = 32,
  className = '',
  showGlow = false,
}) => {
  const filterId = `ab-glow-${Math.random().toString(36).substring(2, 9)}`;
  const gradPrefix = `ab-logo-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
    >
      <defs>
        {/* Glow Filter */}
        {showGlow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}

        {/* 1. Left Primary Ascending Ribbon (Illuminated Front Face) */}
        <linearGradient id={`${gradPrefix}-left-front`} x1="10%" y1="90%" x2="50%" y2="10%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="45%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>

        {/* 2. Left Inner Bevel / Turn */}
        <linearGradient id={`${gradPrefix}-left-inner`} x1="15%" y1="90%" x2="50%" y2="20%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>

        {/* 3. Apex Top Fold */}
        <linearGradient id={`${gradPrefix}-apex-fold`} x1="40%" y1="5%" x2="70%" y2="35%">
          <stop offset="0%" stopColor="#ecfccb" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>

        {/* 4. Right Descending Front Face */}
        <linearGradient id={`${gradPrefix}-right-front`} x1="50%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="40%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>

        {/* 5. Right Outer Bevel / Edge */}
        <linearGradient id={`${gradPrefix}-right-edge`} x1="60%" y1="15%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="60%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>

        {/* 6. Origami Crossbar - Upper Front Plane */}
        <linearGradient id={`${gradPrefix}-cross-front`} x1="30%" y1="65%" x2="65%" y2="60%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>

        {/* 7. Origami Crossbar - Folded Under / Shadow */}
        <linearGradient id={`${gradPrefix}-cross-under`} x1="40%" y1="80%" x2="68%" y2="60%">
          <stop offset="0%" stopColor="#052e16" />
          <stop offset="50%" stopColor="#14532d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>

        {/* 8. Inner Cavity Shadow */}
        <linearGradient id={`${gradPrefix}-inner-shadow`} x1="50%" y1="35%" x2="50%" y2="65%">
          <stop offset="0%" stopColor="#0f291e" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      <g filter={showGlow ? `url(#${filterId})` : undefined}>
        {/* Facet 1: Inner shadow underneath the crossbar loop */}
        <polygon
          points="44,76 66,60 56,60"
          fill={`url(#${gradPrefix}-inner-shadow)`}
          opacity="0.9"
        />

        {/* Facet 2: The Under-fold Ribbon (Connecting through to the right leg) */}
        <polygon
          points="34,64 45,78 68,88 56,62"
          fill={`url(#${gradPrefix}-cross-under)`}
        />

        {/* Facet 3: Left Leg Inner Facet / Bevel */}
        <polygon
          points="6,88 28,88 48,24 38,16"
          fill={`url(#${gradPrefix}-left-inner)`}
        />

        {/* Facet 4: Left Leg Front Glowing Face */}
        <polygon
          points="6,88 18,60 48,10 38,16"
          fill={`url(#${gradPrefix}-left-front)`}
        />

        {/* Facet 5: Apex Fold Cap */}
        <polygon
          points="48,10 60,18 48,24 38,16"
          fill={`url(#${gradPrefix}-apex-fold)`}
        />

        {/* Facet 6: Right Outer Leg Main Descending Facet */}
        <polygon
          points="60,18 88,88 68,88 48,24"
          fill={`url(#${gradPrefix}-right-front)`}
        />

        {/* Facet 7: Right Leg Highlight Bevel */}
        <polygon
          points="56,15 88,88 82,88 48,10"
          fill={`url(#${gradPrefix}-right-edge)`}
          opacity="0.85"
        />

        {/* Facet 8: The Origami Crossbar Front Ribbon (Bridges across with 3D twist) */}
        <polygon
          points="34,64 66,60 56,62 44,76"
          fill={`url(#${gradPrefix}-cross-front)`}
        />

        {/* Facet 9: Micro Highlight Edge on Crossbar fold */}
        <polygon
          points="34,64 56,62 55,60 34,62"
          fill="#ecfccb"
          opacity="0.9"
        />
      </g>
    </svg>
  );
};

