import React from "react";
import { observer } from "mobx-react-lite";
import { Outlet, Route, Routes } from "react-router-dom";
import { useInit } from "./hooks/useInit";
import { HomePage } from "./pages/HomePage/HomePage";
import { Player } from "./components/composit-components/Player/Player";
import { LeftSidebar } from "./components/composit-components/LeftSidebar/LeftSidebar";
import { PlaylistPage } from "./pages/PlaylistPage/PlaylistPage";
import { AuthPage } from "./pages/AuthPage/AuthPage";
import { ChooseArtistsPage } from "./pages/ChooseArtistsPage/ChooseArtistsPage";
import { UserPage } from "./pages/UserPage/UserPage";
import { LikedSongsPage } from "./pages/LikedSongsPage/LikedSongsPage";
import { StatsPage } from "./pages/StatsPage/StatsPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { PublicRoute } from "./components/PublicRoute";

const AppLayout = () => (
  <div className="App">
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <LeftSidebar />

      <Outlet />
    </div>

    <Player />
  </div>
);

const App = observer(() => {
  const { isLoading } = useInit();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route element={<PrivateRoute />}>
        <Route path="/artist" element={<ChooseArtistsPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
          <Route path="/liked" element={<LikedSongsPage />} />
          <Route path="/account" element={<UserPage />} />
          <Route path="/account/stats" element={<StatsPage />} />
        </Route>
      </Route>
    </Routes>
  );
});

export default App;
