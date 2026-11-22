import { Segmented } from '@/components/ui/Segmented'
import { useSettings } from '@/store/settings'
import { useI18n } from '@/i18n'
import type { Lang } from '@/content/types'

/** EN / FR switch — swaps every UI string and content field instantly. */
export function LangToggle({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const lang = useSettings((s) => s.lang)
  const setLang = useSettings((s) => s.setLang)
  const { d } = useI18n()
  return (
    <Segmented<Lang>
      label={d.nav.language}
      value={lang}
      onChange={setLang}
      size={size}
      options={[
        { value: 'en', label: 'EN', title: 'English' },
        { value: 'fr', label: 'FR', title: 'Français' },
      ]}
    />
  )
}
