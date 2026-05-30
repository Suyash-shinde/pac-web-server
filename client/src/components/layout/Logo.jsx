import { Link } from 'react-router-dom'
import './layout.css'

/** PAC wordmark logo (text-based, matches red/silver brand). */
export default function Logo({ size = 'md' }) {
  return (
    <Link to="/" className={`logo logo--${size}`} aria-label="Pune Anime Community home">
      <span className="logo__mark" aria-hidden="true">
        PAC
      </span>
      <span className="logo__text">
        Pune Anime <span className="logo__accent">Community</span>
      </span>
    </Link>
  )
}
