import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DecryptText } from '@/components/ui/DecryptText'
import { useI18n } from '@/i18n'

export default function NotFound() {
  const { d } = useI18n()
  return (
    <div className="mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="font-mono text-[clamp(4rem,16vw,9rem)] leading-none font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold"><DecryptText text={d.notFound.title} /></h1>
      <p className="mt-3 text-muted">{d.notFound.body}</p>
      <pre className="glass mt-8 rounded-xl px-5 py-4 text-left font-mono text-xs text-muted">
{`traceroute to page (10.4.0.4)
 1  10.0.0.1      0.42 ms
 2  10.0.0.2      1.10 ms
 3  * * *
 4  * * *  `}<span className="text-danger">Destination unreachable</span>
      </pre>
      <div className="mt-8">
        <Button to="/" icon={<Home size={16} />}>{d.notFound.back}</Button>
      </div>
    </div>
  )
}
