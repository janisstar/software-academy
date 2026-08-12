import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { LegalLayout } from '../../components/legal/LegalLayout'

/* Тексты живут в словаре, здесь — только ключи. `as const` нужен, чтобы
   TypeScript проверил ключи по словарю, а не принял любую строку. */
const SECTIONS = [
  {
    titleKey: 'legal.privacy.general.title',
    textKey: 'legal.privacy.general.text',
  },
  {
    titleKey: 'legal.privacy.data.title',
    textKey: 'legal.privacy.data.text',
  },
  {
    titleKey: 'legal.privacy.rights.title',
    textKey: 'legal.privacy.rights.text',
  },
] as const

/**
 * Публичная страница Privacy Policy: доступна без входа, потому что ссылку на
 * неё даёт и футер лендинга, и экран согласий при первом входе.
 *
 * Текст — заглушка по структуре макета. Реальный юридический текст вставим,
 * когда он будет готов; тогда же проверим версию и дату в `legal.privacy.meta`.
 */
export function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout
      title={t('legal.privacy.title')}
      meta={t('legal.privacy.meta')}
    >
      {SECTIONS.map(({ titleKey, textKey }) => (
        <Fragment key={titleKey}>
          <h2>{t(titleKey)}</h2>
          <p>{t(textKey)}</p>
        </Fragment>
      ))}
    </LegalLayout>
  )
}
