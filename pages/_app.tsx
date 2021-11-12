import '../styles/index.scss'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core'
import { appWithTranslation } from 'next-i18next'
import OmniAural from "omniaural"
import React from 'react'
import { CookiesProvider } from 'react-cookie'
import Modal from 'react-modal'
import { Modals, NavBar, HorizontalNavBar, Player } from '~/components'
import "~/state"

fontAwesomeConfig.autoAddCss = false

Modal.setAppElement('.app')

function MyApp({ Component, pageProps }) {
  const { serverInitialState } = pageProps
  OmniAural.initGlobalState(serverInitialState)

  return (
    <CookiesProvider>
      <div className='app'>
        <div className='app-wrapper'>
          <NavBar />
          <div className='app-main-wrapper'>
            <HorizontalNavBar serverSideCookies={pageProps.serverSideCookies} />
            <main>
              <Component {...pageProps} />
            </main>
          </div>
        </div>
        <Player />
        <Modals />
      </div>
    </CookiesProvider>
  )
}

export default appWithTranslation(MyApp)
