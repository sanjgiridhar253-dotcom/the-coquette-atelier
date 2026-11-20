function RibbonBow({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path
        d="M56 43C39 20 17 20 20 37c2 11 19 13 34 8m10-2c17-23 39-23 36-6-2 11-19 13-34 8M57 47C46 60 39 73 38 83c11-4 19-13 25-27m0-9c11 13 18 26 19 36-11-4-19-13-25-27"
        fill="rgba(185,120,131,.2)"
        stroke="#b97883"
        strokeOpacity=".7"
        strokeWidth="2"
      />
      <path d="M53 42c4-5 10-5 14 0-4 6-10 6-14 0Z" fill="#b97883" fillOpacity=".55" />
    </svg>
  )
}

export default RibbonBow
