import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Characters from './pages/discovery/Characters';
import CharacterDetails from './pages/discovery/CharacterDetails';
import Articles from './pages/discovery/Articles';
import ArticleDetails from './pages/discovery/ArticleDetails';
import Events from './pages/discovery/Events';
import EventDetails from './pages/discovery/EventDetails';
import Releases from './pages/discovery/Releases';
import Merch from './pages/discovery/Merch';
import MerchDetails from './pages/discovery/MerchDetails';
import Feedback from './pages/discovery/Feedback';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCharacters from './pages/admin/ManageCharacters';
import ManageArticles from './pages/admin/ManageArticles';
import ManageContent from './pages/admin/ManageContent';
import ManageMedia from './pages/admin/ManageMedia';
import ManageEvents from './pages/admin/ManageEvents';
import ManageReleases from './pages/admin/ManageReleases';
import ManageMerch from './pages/admin/ManageMerch';
import ManageSubmissions from './pages/admin/ManageSubmissions';
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageUsers from './pages/admin/ManageUsers';






function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/characters" />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/characters/:id" element={<CharacterDetails />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetails />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/merch/:id" element={<MerchDetails />} />
        <Route path="/feedback" element={<Feedback />} />

        {}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/characters" element={<ManageCharacters />} />
        <Route path="/admin/articles" element={<ManageArticles />} />
        <Route path="/admin/content" element={<ManageContent />} />
        <Route path="/admin/media" element={<ManageMedia />} />
        <Route path="/admin/events" element={<ManageEvents />} />
        <Route path="/admin/releases" element={<ManageReleases />} />
        <Route path="/admin/merch" element={<ManageMerch />} />
        <Route path="/admin/submissions" element={<ManageSubmissions />} />
        <Route path="/admin/feedback" element={<ManageFeedback />} />
        <Route path="/admin/users" element={<ManageUsers />} />

        {}
        {}
        {}
        {}
        {}
        {}
        {}
        {}
        {}
      </Routes>
    </Router>
  );
}

export default App;