
import { Routes, Route, Navigate } from 'react-router-dom';

import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Explore from './pages/Explore';
import ExploreCategory from './pages/ExploreCategory';
import ContentDetails from './pages/ContentDetails';
import Articles from './pages/Articles';
import Characters from './pages/Characters';
import CharacterDetails from './pages/CharacterDetails';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Bookmarks from './pages/Bookmarks';
import SubmitContent from './pages/SubmitContent';
import MySubmissions from './pages/MySubmissions';

import ArticleDetails from './pages/ArticleDetails';

import ManageContent from './pages/ManageContent';
import ManageCharacters from './pages/ManageCharacters';
import ManageArticles from './pages/ManageArticles';
import ManageSubmissions from './pages/ManageSubmissions';

// Existing shared layout
import MainLayout from './components/MainLayout.jsx';

// Dedicated Movie Details page
import MovieDetails from './pages/MovieDetails.jsx';

function App() {
  return (
    <Routes>
      {/* Default → Explore */}
      <Route
        path="/"
        element={<Navigate to="/explore" replace />}
      />

      {/* ============ AUTH PAGES ============ */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* ============ SHARED MAIN LAYOUT ============ */}
      <Route element={<MainLayout />}>
        
        {/* ============ MAIN PAGES ============ */}
        <Route path="/explore" element={<Explore />} />
        <Route
          path="/explore/:slug"
          element={<ExploreCategory />}
        />
        <Route
          path="/content/:id"
          element={<ContentDetails />}
        />

        {/* Dedicated Movie Details */}
        <Route
          path="/movies/:id"
          element={<MovieDetails />}
        />

        <Route path="/articles" element={<Articles />} />
        <Route
          path="/article/:id"
          element={<ArticleDetails />}
        />

        {/* ============ CHARACTER PAGES ============ */}
        <Route
          path="/characters"
          element={<Characters />}
        />
        <Route
          path="/characters/:id"
          element={<CharacterDetails />}
        />

        {/* ============ USER PAGES ============ */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/bookmarks"
          element={<Bookmarks />}
        />
        <Route
          path="/submit-content"
          element={<SubmitContent />}
        />
        <Route
          path="/my-submissions"
          element={<MySubmissions />}
        />

        {/* ============ MANAGE / ADMIN PAGES ============ */}
        <Route
          path="/manage/content"
          element={<ManageContent />}
        />
        <Route
          path="/manage/characters"
          element={<ManageCharacters />}
        />
        <Route
          path="/manage/articles"
          element={<ManageArticles />}
        />
        <Route
          path="/manage/submissions"
          element={<ManageSubmissions />}
        />

      </Route>

      {/* ============ 404 ============ */}
      <Route
        path="*"
        element={<Navigate to="/explore" replace />}
      />
    </Routes>
  );
}

export default App;
