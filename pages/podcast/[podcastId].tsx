import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import OmniAural from "omniaural"
import type { Episode, Podcast } from 'podverse-shared'
import { useEffect, useState } from 'react'
import { EpisodeListItem, List, PageHeader, PageScrollableContent, Pagination, PodcastListItem, PodcastPageHeader, SideContent } from '~/components'
import { PV } from '~/resources'
import { getPodcastById } from '~/services/podcast'
import { getEpisodesByQuery } from '~/services/episode'
import { refreshAuthenticatedUserInfoState } from '~/state/auth/auth'
import { initServerState } from '~/state/initServerState'

type Props = {
  serverFilterPage: number
  serverFilterSort: string
  serverFilterType: string
  serverListData: Podcast[]
  serverListDataCount: number
  serverPodcast: Podcast
}

type FilterState = {
  filterPage?: number
  filterSort?: string
  filterType?: string
}

const keyPrefix = 'pages_podcast'

export default function Podcast(props: Props) {
  const { serverFilterPage, serverFilterSort, serverFilterType,
    serverListData, serverListDataCount, serverPodcast } = props
  const { id } = serverPodcast

  const { t } = useTranslation()

  const [filterState, setFilterState] = useState({
    filterPage: serverFilterPage,
    filterSort: serverFilterSort,
    filterType: serverFilterType
  } as FilterState)
  const { filterPage, filterSort, filterType } = filterState
  const [listData, setListData] = useState<Episode[]>(serverListData)
  const [listDataCount, setListDataCount] = useState<number>(serverListDataCount)

  const pageCount = Math.ceil(listDataCount / PV.Config.QUERY_RESULTS_LIMIT_DEFAULT)

  const pageTitle = serverPodcast.title || t('untitledPodcast')

  useEffect(() => {
    (async () => {
      const { data } = await clientQueryEpisodes(
        { page: filterPage, podcastId: id, sort: filterSort },
        filterState
      )
      const newListData = data[0]
      const newListCount = data[1]
      setListData(newListData)
      setListDataCount(newListCount)
    })()
  }, [filterPage, filterSort, filterType])

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PodcastPageHeader podcast={serverPodcast} />
      <PageScrollableContent>
        <div className='row'>
          <div className='column'>
            <PageHeader
              isSubHeader
              primaryOnChange={(selectedItems: any[]) => {
                const selectedItem = selectedItems[0]
                setFilterState({ filterPage: 1, filterSort, filterType: selectedItem.key })
              }}
              primaryOptions={generateTypeOptions(t)}
              primarySelected={filterType}
              sortOnChange={(selectedItems: any[]) => {
                const selectedItem = selectedItems[0]
                setFilterState({ filterPage: 1, filterSort: selectedItem.key, filterType })
              }}
              sortOptions={generateSortOptions(t)}
              sortSelected={filterSort}
              text={t('Episodes')} />
            <List>
              {generateEpisodeListElements(listData)}
            </List>
            <Pagination
              currentPageIndex={filterPage}
              handlePageNavigate={(newPage) => {
                setFilterState({ filterPage: newPage, filterSort, filterType })
              }}
              handlePageNext={() => {
                const newPage = filterPage + 1
                if (newPage <= pageCount) {
                  setFilterState({ filterPage: newPage, filterSort, filterType })
                }
              }}
              handlePagePrevious={() => {
                const newPage = filterPage - 1
                if (newPage > 0) {
                  setFilterState({ filterPage: newPage, filterSort, filterType })
                }
              }}
              pageCount={pageCount} />
          </div>
          <div className='column'>
            <SideContent>
              <h2>{t('About')}</h2>
              <div className='text'>{serverPodcast.description}</div>
            </SideContent>
          </div>
        </div>
      </PageScrollableContent>
    </>
  )
}

/* Server-side logic */

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  initServerState()
  const { locale, params, req } = ctx
  const { cookies } = req
  const { podcastId } = params

  let userInfo = null
  if (cookies.Authorization) {
    userInfo = await refreshAuthenticatedUserInfoState(cookies.Authorization)
  }

  const serverFilterType = PV.Filters.type._episodes
  const serverFilterSort = PV.Filters.sort._mostRecent

  const serverFilterPage = 1

  const response = await getPodcastById(podcastId)
  const podcast = response.data

  let listData = []
  let listDataCount = 0
  if (serverFilterType === PV.Filters.type._episodes) {
    const response = await getEpisodesByQuery({
      podcastId: podcastId,
      sort: serverFilterSort
    })
    listData = response.data[0]
    listDataCount = response.data[1]
  } else {
    // handle mediaRefs query
  }

  return {
    props: {
      serverInitialState: OmniAural.state.value(),
      ...(await serverSideTranslations(locale, PV.i18n.fileNames.all)),
      serverFilterPage,
      serverFilterSort,
      serverFilterType,
      // serverInitialUserInfo: userInfo,
      serverListData: listData,
      serverListDataCount: listDataCount,
      serverPodcast: podcast,
      serverSideCookies: cookies
    }
  }
}

/* Client-side logic */

type ClientQueryEpisodes = {
  page?: number
  podcastId?: string
  sort?: string
}

const clientQueryEpisodes = async (
  { page, podcastId, sort }: ClientQueryEpisodes,
  filterState: FilterState
) => {
  const finalQuery = {
    podcastId,
    ...(page ? { page } : { page: filterState.filterPage }),
    ...(sort ? { sort } : { sort: filterState.filterSort })
  }
  return getEpisodesByQuery(finalQuery)
}

/* Helpers */

const generateTypeOptions = (t: any) => [
  { label: t('Episodes'), key: PV.Filters.type._episodes },
  { label: t('Clips'), key: PV.Filters.type._clips }
]

const generateSortOptions = (t: any) => [
  { label: t('Recent'), key: PV.Filters.sort._mostRecent },
  { label: t('Top - Past Day'), key: PV.Filters.sort._topPastDay },
  { label: t('Top - Past Week'), key: PV.Filters.sort._topPastWeek },
  { label: t('Top - Past Month'), key: PV.Filters.sort._topPastMonth },
  { label: t('Top - Past Year'), key: PV.Filters.sort._topPastYear },
  { label: t('Top - All Time'), key: PV.Filters.sort._topAllTime },
  { label: t('Oldest'), key: PV.Filters.sort._oldest }
]

const generateEpisodeListElements = (listItems: Episode[]) => {
  return listItems.map((listItem, index) =>
    <EpisodeListItem
      episode={listItem}
      key={`${keyPrefix}-${index}`} />
  )
}
