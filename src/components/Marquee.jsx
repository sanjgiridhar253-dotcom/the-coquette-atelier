// Endless ticker. The phrases are rendered twice and each copy slides by exactly its own
// length, so the loop has no visible join. Decorative: the text repeats copy found elsewhere.
function Marquee({ items, className = '', vertical = false }) {
  const group = (
    <div className="marquee-group">
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
          <span className="marquee-mark">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className={`marquee ${vertical ? 'marquee-vertical' : ''} ${className}`} aria-hidden="true">
      {group}
      {group}
    </div>
  )
}

export default Marquee
