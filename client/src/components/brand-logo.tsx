import { Link } from 'react-router-dom'
import { APP_DISPLAY_NAME } from '@/lib/brand'

type BrandLogoProps = {
  className?: string
  linked?: boolean
}

export function BrandLogo({ className = '', linked = true }: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.webp"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-full object-cover ring-1 ring-border/60 shadow-sm"
        decoding="async"
      />
      <span className="font-semibold tracking-tight text-sm">{APP_DISPLAY_NAME}</span>
    </span>
  )

  if (!linked) return content

  return (
    <Link to="/" className="transition-opacity hover:opacity-80">
      {content}
    </Link>
  )
}
