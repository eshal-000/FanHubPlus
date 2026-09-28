import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import PageLoader from '../components/PageLoader.jsx'

const ROUTE_LOADER_DURATION = 600

function MainLayout({ initialLoading = false }) {
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)
  const [routeLoading, setRouteLoading] = useState(false)



  if (prevPathRef.current !== location.pathname) {
    prevPathRef.current = location.pathname
    if (!routeLoading) {
      setRouteLoading(true)
    }
  }

  useEffect(() => {
    if (!routeLoading) return undefined

    window.scrollTo({ top: 0, behavior: 'auto' })
    const timer = window.setTimeout(() => setRouteLoading(false), ROUTE_LOADER_DURATION)

    return () => window.clearTimeout(timer)
  }, [routeLoading])



  const appReady = !initialLoading && !routeLoading

  return (
    <div className="min-h-screen bg-bg text-cream">
      <PageLoader active={routeLoading} variant="route" />
      <Navbar />
      <main>
        <Outlet context={{ appReady }} />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
