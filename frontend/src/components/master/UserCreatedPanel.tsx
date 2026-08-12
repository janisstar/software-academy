import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { CodePanel } from '../ui/CodePanel'
import { PEOPLE_PATHS, userPath } from '../../constants/routes'
import type { UserCreated } from '../../types/api'
import styles from './UserCreatedPanel.module.css'

type UserCreatedPanelProps = {
  created: UserCreated
}

/**
 * Экран после создания пользователя: временный пароль показывается ЗДЕСЬ и
 * больше нигде. Ушли со страницы — пароль потерян, и остаётся только выпустить
 * код сброса со страницы пользователя.
 */
export function UserCreatedPanel({ created }: UserCreatedPanelProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, temp_password: tempPassword } = created

  return (
    <div className={styles.wrap}>
      <p className={styles.intro}>
        {t('people.newUser.createdIntro', { name: user.name, un: user.un })}
      </p>

      <div className={styles.panel}>
        <CodePanel
          code={tempPassword}
          caption={t('people.newUser.tempPassword')}
          note={t('people.newUser.shownOnce')}
          copyLabel={t('people.newUser.copyPassword')}
          copiedLabel={t('people.newUser.copied')}
        />
      </div>

      <p className={styles.warning}>
        <span aria-hidden="true">{t('common.warningSign')}</span>
        <span>{t('people.newUser.handoverWarning')}</span>
      </p>

      <div className={styles.actions}>
        {/* Переходы делаем через navigate: кнопка в ссылке — невалидная
            вёрстка (<button> внутри <a>), а вид нужен именно кнопочный. */}
        <Button onClick={() => navigate(PEOPLE_PATHS.users)}>
          {t('people.newUser.backToUsers')}
        </Button>
        <Button variant="outline" onClick={() => navigate(userPath(user.un))}>
          {t('people.newUser.openUserPage')}
        </Button>
      </div>
    </div>
  )
}
