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

  // Detect a pathname change DURING RENDER rather than in an effect. This
  // matters: child components (e.g. Home) run their effects BEFORE this
  // layout's effects do, so if we only flipped `routeLoading` inside a
  // useEffect here, a freshly-mounted page could read "not loading yet"
  // for one frame before this effect catches up — reopening the same
  // "entrance animation plays behind the loader" bug this fix is for.
  // Updating state directly in the render body (React's documented
  // pattern for deriving state from a changed prop/value) means
  // `routeLoading` is already correct in the very same render pass the
  // new page mounts in.
  //
  // prevPathRef starts equal to the initial pathname, so this never fires
  // on first mount — App.jsx already shows the "initial" loader variant
  // for the very first website load.
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

  // True once neither the initial cinematic loader nor a route-change
  // loader is covering the screen — pages can safely play entrance
  // animations once this is true.
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
