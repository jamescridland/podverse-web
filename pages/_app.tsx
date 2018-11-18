import React, { Fragment } from 'react'
import { Provider } from 'react-redux'
import withRedux from 'next-redux-wrapper'
import App, { Container } from 'next/app'
import { getPriorityQueueItemsStorage } from 'podverse-ui'
import Auth from '~/components/auth'
import Meta from '~/components/meta'
import Footer from '~/components/Footer/Footer'
import NavBar from '~/components/NavBar/NavBar'
import MediaPlayerView from '~/components/MediaPlayerView/MediaPlayerView'
import { addFontAwesomeIcons } from '~/lib/fontAwesomeIcons'
import { NowPlayingItem } from '~/lib/nowPlayingItem'
import { initializeStore } from '~/redux/store'
import { playerQueueLoadPriorityItems } from '~/redux/actions'

addFontAwesomeIcons()

declare global {
  interface Window { nowPlayingItem: NowPlayingItem }
}

type Props = {
  currentPage: {
    episode: any
    listItems: any[]
    mediaRef: any
    nowPlayingItem: any
    podcast: any
  }
  mediaPlayer: {
    nowPlayingItem: any
    playing?: boolean
  }
  playerQueue: {
    priorityItems: any[]
    secondaryItems: any[]
  }
  playerQueueLoadPriorityItems?: any
  store?: any
}

export default withRedux(initializeStore)(class MyApp extends App<Props> {
  
  static defaultProps: Props = {
    currentPage: {
      episode: null,
      listItems: [],
      mediaRef: null,
      nowPlayingItem: null,
      podcast: null
    },
    mediaPlayer: {
      nowPlayingItem: {}
    },
    playerQueue: {
      priorityItems: [],
      secondaryItems: []
    }
  }
  
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  componentDidMount() {
    const { store } = this.props
    const priorityItems = getPriorityQueueItemsStorage()
    store.dispatch(playerQueueLoadPriorityItems(priorityItems))
  }

  render() {
    const { Component, pageProps, store } = this.props

    return (
      <Container>
        <Provider store={store}>
          <Fragment>
            <Meta />
            {/* <Auth /> */}
            <div className='view'>
              <div className='view__navbar'>
                <NavBar />
              </div>
              <div className='view__contents'>
                <div className='max-width'>
                  <Component {...pageProps} />
                  <Footer />
                </div>
              </div>
              <MediaPlayerView {...pageProps} />
            </div>
          </Fragment>
        </Provider>
      </Container>
    )
  }
}) 
