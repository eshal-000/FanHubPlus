import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import FloatingChatbot from '../components/FloatingChatbot.jsx'
import Navbar from '../components/Navbar.jsx'
import PageLoader from '../components/PageLoader.jsx'

function MainLayout({ initialLoading = false }) {
  const location = useLocation()
  const firstRoute = useRef(true)
  const [routeLoading, setRouteLoading] = useState(false)

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false
      return undefined
    }

    setRouteLoading(true)
    const timer = window.setTimeout(() => setRouteLoading(false), 2000)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-bg text-cream">
      <PageLoader active={routeLoading} />
      <Navbar />
      <main>
        <Outlet context={{ appReady: !initialLoading && !routeLoading }} />
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  )
}

export default MainLayout
