import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import PageLoader from './components/PageLoader.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminShell from './components/admin/AdminShell.jsx'
import Home from './pages/Home.jsx'
import Media from './pages/Media.jsx'
import MediaDetails from './pages/MediaDetails.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import About from './pages/About.jsx'
import ArticleDetails from './pages/ArticleDetails.jsx'
import Articles from './pages/Articles.jsx'
import Bookmarks from './pages/Bookmarks.jsx'
import CharacterDetails from './pages/CharacterDetails.jsx'
import Characters from './pages/Characters.jsx'
import ContentDetails from './pages/ContentDetails.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import ManageArticles from './pages/admin/ManageArticles.jsx'
import ManageCharacters from './pages/admin/ManageCharacters.jsx'
import ManageContent from './pages/admin/ManageContent.jsx'
import ManageEvents from './pages/admin/ManageEvents.jsx'
import ManageFeedback from './pages/admin/ManageFeedback.jsx'
import ManageMerch from './pages/admin/ManageMerch.jsx'
import ManageReleases from './pages/admin/ManageReleases.jsx'
import ManageSubmissions from './pages/admin/ManageSubmissions.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import Explore from './pages/Explore.jsx'
import ExploreCategory from './pages/ExploreCategory.jsx'
import Events from './pages/discovery/Events.jsx'
import EventDetails from './pages/discovery/EventDetails.jsx'
import Feedback from './pages/discovery/Feedback.jsx'
import Merch from './pages/discovery/Merch.jsx'
import MerchDetails from './pages/discovery/MerchDetails.jsx'
import Releases from './pages/discovery/Releases.jsx'
import MySubmissions from './pages/MySubmissions.jsx'
import SubmitContent from './pages/SubmitContent.jsx'

function App() {
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setInitialLoading(false), 2200)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <PageLoader active={initialLoading} variant="initial" />
      <Routes>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute allowedRoles={['admin']} loginPath="/admin/login" />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/content" element={<ManageContent />} />
          <Route path="admin/characters" element={<ManageCharacters />} />
          <Route path="admin/articles" element={<ManageArticles />} />
          <Route path="admin/media" element={<OwnerReserved owner="Eshal" title="Manage Media" />} />
          <Route path="admin/events" element={<ManageEvents />} />
          <Route path="admin/releases" element={<ManageReleases />} />
          <Route path="admin/merch" element={<ManageMerch />} />
          <Route path="admin/submissions" element={<ManageSubmissions />} />
          <Route path="admin/feedback" element={<ManageFeedback />} />
          <Route path="admin/users" element={<ManageUsers />} />
          <Route path="admin/*" element={<Navigate to="/admin" replace />} />
        </Route>


        <Route element={<MainLayout initialLoading={initialLoading} />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="media" element={<Media />} />
          <Route path="media/:id" element={<MediaDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          <Route path="explore" element={<Explore />} />
          <Route path="explore/:slug" element={<ExploreCategory />} />
          <Route path="content/:id" element={<ContentDetails />} />
          <Route path="characters" element={<Characters />} />
          <Route path="characters/:id" element={<CharacterDetails />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:id" element={<ArticleDetails />} />
          <Route path="article/:id" element={<ArticleDetails />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="releases" element={<Releases />} />
          <Route path="merch" element={<Merch />} />
          <Route path="merch/:id" element={<MerchDetails />} />
          <Route path="feedback" element={<Feedback />} />

          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="submit-content" element={<SubmitContent />} />
            <Route path="my-submissions" element={<MySubmissions />} />
          </Route>

          <Route path="not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>
      </Routes>
    </>
  )
}

function OwnerReserved({ owner, title }) {
  return (
    <AdminShell title={title} subtitle={`${owner} module`}>
      <section className="flex min-h-[50vh] w-full items-center py-12">
        <div className="surface-panel w-full p-8">
          <p className="ui-label text-sm uppercase tracking-[0.28em] text-yellow">
            {owner} module
          </p>
          <h1 className="mt-4 text-3xl font-black text-cream md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-muted">
            This route is reserved in the shared app shell and intentionally left for its assigned owner.
          </p>
        </div>
      </section>
    </AdminShell>
  )
}

function NotFound() {
  return (
    <section className="fp-container flex min-h-[50vh] w-full items-center py-20">
      <div className="surface-panel w-full p-8">
        <p className="ui-label text-sm uppercase tracking-[0.28em] text-yellow">404</p>
        <h1 className="mt-4 text-3xl font-black text-cream md:text-5xl">Page not found</h1>
        <p className="mt-4 text-muted">The requested Fan Hub Plus route is not registered.</p>
      </div>
    </section>
  )
}

export default App
