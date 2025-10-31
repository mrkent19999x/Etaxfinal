export function TaxLogo() {
  return (
    <svg viewBox="0 0 200 200" className="w-24 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Red circle background */}
      <circle cx="100" cy="100" r="95" fill="#DC143C" />

      {/* Yellow star */}
      <g transform="translate(100, 70)">
        <polygon points="0,-25 7.5,-7.5 25,-7.5 12.5,5 20,25 0,12.5 -20,25 -12.5,5 -25,-7.5 -7.5,-7.5" fill="#FFD700" />
      </g>

      {/* Building icon */}
      <g transform="translate(100, 120)">
        {/* Building outline */}
        <rect x="-15" y="-10" width="30" height="25" fill="none" stroke="#FFD700" strokeWidth="2" />

        {/* Windows */}
        <rect x="-10" y="-5" width="4" height="4" fill="#FFD700" />
        <rect x="-2" y="-5" width="4" height="4" fill="#FFD700" />
        <rect x="6" y="-5" width="4" height="4" fill="#FFD700" />

        <rect x="-10" y="3" width="4" height="4" fill="#FFD700" />
        <rect x="-2" y="3" width="4" height="4" fill="#FFD700" />
        <rect x="6" y="3" width="4" height="4" fill="#FFD700" />

        {/* Door */}
        <rect x="-3" y="8" width="6" height="8" fill="none" stroke="#FFD700" strokeWidth="1.5" />
      </g>
    </svg>
  )
}
