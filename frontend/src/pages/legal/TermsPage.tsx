import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { LegalLayout } from '../../components/legal/LegalLayout'

/* Тексты живут в словаре, здесь — только ключи. `as const` нужен, чтобы
   TypeScript проверил ключи по словарю, а не принял любую строку. */
const SECTIONS = [
  {
    titleKey: 'legal.terms.general.title',
    textKey: 'legal.terms.general.text',
  },
  {
    titleKey: 'legal.terms.access.title',
    textKey: 'legal.terms.access.text',
  },
  {
    titleKey: 'legal.terms.data.title',
    textKey: 'legal.terms.data.text',
  },
] as const

/**
 * Публичная страница Terms & Conditions: доступна без входа, потому что ссылку
 * на неё даёт и футер лендинга, и экран согласий при первом входе.
 *
 * Текст — заглушка по структуре макета. Реальный юридический текст вставим,
 * когда он будет готов; тогда же проверим версию и дату в `legal.terms.meta`.
 */
export function TermsPage() {
  const { t } = useTranslation()

  return (
    <LegalLayout title={t('legal.terms.title')} meta={t('legal.terms.meta')}>
      {SECTIONS.map(({ titleKey, textKey }) => (
        <Fragment key={titleKey}>
          <h2>{t(titleKey)}</h2>
          <p>{t(textKey)}</p>
        </Fragment>
      ))}
    </LegalLayout>
  )
}
