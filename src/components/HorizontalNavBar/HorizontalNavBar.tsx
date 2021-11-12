import { faChevronLeft, faChevronRight, faMoon, faSun, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { faUserCircle as faUserCircleRegular } from '@fortawesome/free-regular-svg-icons'
import { useRouter } from 'next/router'
import OmniAural, { useOmniAural } from "omniaural"
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCookies } from 'react-cookie'
import { ButtonCircle, Dropdown, SwitchWithIcons } from '~/components'
import { PV } from '~/resources'

type Props = {
  serverSideCookies: any
}

const _myProfileKey = '_myProfile'
const _membershipKey = '_membership'
const _settingsKey = '_settings'
const _logInKey = '_logIn'
const _logOutKey = '_logOut'

export const HorizontalNavBar = ({ serverSideCookies }: Props) => {
  const [lightModeChecked, setLightModeChecked] = useState<boolean>(serverSideCookies.lightMode)
  const [cookies, setCookie, removeCookie] = useCookies([])
  const router = useRouter()
  const { t } = useTranslation()
  const [userInfo] = useOmniAural("session.userInfo")

  useEffect(() => {
    if (!lightModeChecked) {
      removeCookie(PV.Cookies.keys.lightMode, { path: PV.Cookies.path })
    } else {
      setCookie(PV.Cookies.keys.lightMode, lightModeChecked, { path: PV.Cookies.path })
    }
  }, [lightModeChecked])

  const navigateBack = () => {
    window.history.back()
  }

  const navigateForward = () => {
    window.history.forward()

    OmniAural.togglePlayer(!OmniAural.state.player.show.value())
  }

  const lightModeOnChange = () => {
    setLightModeChecked(prev => {
      document.documentElement.className = !prev ? 'theme-light' : 'theme-dark'
      return !prev
    })
  }

  const dropdownItems = generateDropdownItems(t)

  const onChange = (selected) => {
    const item = selected[0]
    if (item) {
      if (item.key === _membershipKey) {
        router.push(PV.RoutePaths.web.membership)
      } else if (item.key === _settingsKey) {
        router.push(PV.RoutePaths.web.settings)
      } else if (item.key === _logInKey) {
        console.log('Login')
        OmniAural.modalsLoginShow()
      } else if (item.key === _logOutKey) {
        console.log('Logout')
      }
    }
  }

  return (
    <div className='horizontal-navbar-wrapper'>
      <nav className='navbar-secondary main-max-width'>
        <div className='navbar-secondary__page-navs'>
          <ButtonCircle
            className='backwards'
            faIcon={faChevronLeft}
            onClick={navigateBack}
            size='small' />
          <ButtonCircle
            className='forwards'
            faIcon={faChevronRight}
            onClick={navigateForward}
            size='small' />
        </div>
        <div className='navbar-secondary__dropdown'>
          <Dropdown
            faIcon={!!userInfo ? faUserCircle : faUserCircleRegular}
            onChange={onChange}
            options={dropdownItems} />
        </div>
        <div className='navbar-secondary__theme-toggle'>
          <SwitchWithIcons
            ariaLabel={t('ARIA - Toggle UI theme change')}
            checked={!lightModeChecked}
            faIconBeginning={faSun}
            faIconEnding={faMoon}
            onChange={lightModeOnChange} />
        </div>
      </nav>
    </div>
  )
}

/* Helpers */

const generateDropdownItems = (t: any) => {
  const isLoggedIn = false

  const items = [
    { label: t('Membership'), key: _membershipKey },
    { label: t('Settings'), key: _settingsKey },
  ]

  if (isLoggedIn) {
    items.unshift({ label: t('MyProfile'), key: _myProfileKey })
    items.push({ label: t('Logout'), key: _logOutKey })
  } else {
    items.push({ label: t('Login'), key: _logInKey })
  }

  return items
}
