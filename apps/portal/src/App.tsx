import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { FeatureDefinition } from '@cotato/contracts'
import { BrandMark } from './components/BrandMark'
import { findFeatureByPath } from './feature-registry'
import { HomePage } from './pages/HomePage'
import './portal.css'

function getPath() {
  return window.location.pathname
}

function FeatureLoading() {
  return (
    <div className="feature-loading">
      <BrandMark />
      <p>기능을 불러오는 중입니다</p>
    </div>
  )
}

export default function App() {
  const [path, setPath] = useState(getPath)
  const [syncing, setSyncing] = useState(false)
  const feature = findFeatureByPath(path)
  const FeatureComponent = useMemo(
    () => (feature ? lazy(feature.load) : null),
    [feature],
  )

  useEffect(() => {
    const handlePopState = () => setPath(getPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const openFeature = (nextFeature: FeatureDefinition) => {
    navigate(nextFeature.path)
  }

  const syncLatest = async () => {
    if (syncing) {
      return
    }

    setSyncing(true)

    try {
      const response = await fetch('/__sync/latest', {
        method: 'POST',
      })

      const result = await response.json() as { ok: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '최신 Git 반영에 실패했습니다.')
      }

      window.location.reload()
    } catch (error) {
      setSyncing(false)
      window.alert(error instanceof Error ? error.message : '최신 Git 반영에 실패했습니다.')
    }
  }

  if (FeatureComponent && feature) {
    return (
      <div className="feature-host">
        <button
          type="button"
          className="feature-back"
          onClick={() => navigate('/')}
          aria-label="기능 목록으로 돌아가기"
        >
          <span aria-hidden="true">←</span>
          <span>TOOLS</span>
        </button>
        <Suspense fallback={<FeatureLoading />}>
          <FeatureComponent />
        </Suspense>
      </div>
    )
  }

  if (path !== '/') {
    return (
      <main className="not-found">
        <BrandMark />
        <p>404 · FEATURE NOT FOUND</p>
        <h1>등록되지 않은 기능입니다.</h1>
        <button type="button" onClick={() => navigate('/')}>포털로 돌아가기</button>
      </main>
    )
  }

  return <HomePage onOpen={openFeature} onSync={syncLatest} syncing={syncing} />
}
