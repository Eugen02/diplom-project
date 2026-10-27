import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { FaHeart, FaMusic } from "react-icons/fa";
import { TrackCard } from "../../components/shared-components/TrackCard/TrackCard";
import { Input } from "../../components/shared-components/Input/Input";
import { GenresModal } from "../../components/composit-components/GenresModal/GenresModal";
import { trackApi } from "../../api/requests/track.api";
import { userApi } from "../../api/user.api";
import { Title } from "../../components/shared-components/Title/Title";
import { usePlaylistStore } from "../../hooks/usePlaylistStore";
import { colors } from "../../constants/colors";
import {
  EmptyStateStyledWrapper,
  HomePageStyledWrapper,
  SearchInputStyledWrapper,
  TasteTileCoverStyledWrapper,
  TasteTileNameStyledWrapper,
  TasteTileStyledWrapper,
  TasteTilesStyledWrapper,
  TrackGridStyledWrapper,
} from "./HomePage.styled";

export const HomePage = observer((): ReactElement => {
  const [rootTracks, setRootTracks] = useState<any>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any>([]);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [showGenresModal, setShowGenresModal] = useState(false);
  const { playlists = [] } = usePlaylistStore();

  useEffect(() => {
    // react-router's location.state is backed by history.state, which
    // survives a plain page refresh - clear it right after reading it once,
    // so the modal doesn't come back on every reload of this history entry.
    if ((location.state as any)?.justSignedUp) {
      setShowGenresModal(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchRootTracks = async () => {
      const rootTracks = await trackApi.getRootTracks();

      setRootTracks(rootTracks || []);
    };

    fetchRootTracks();
  }, []);

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      const recentlyPlayed = await userApi.getRecentlyPlayed(10);

      setRecentlyPlayed(recentlyPlayed || []);
    };

    fetchRecentlyPlayed();
  }, []);

  const trendingTracks = useMemo(() => rootTracks.slice(0, 10), [rootTracks]);
  const exploreTracks = useMemo(() => rootTracks.slice(10), [rootTracks]);

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = query ? rootTracks : exploreTracks;

    if (!query) {
      return source;
    }

    return source.filter((track: any) => {
      const artistNames = (track.artists || [])
        .map((artist: any) => artist?.name || "")
        .join(" ")
        .toLowerCase();

      return (
        track.trackName?.toLowerCase().includes(query) ||
        artistNames.includes(query)
      );
    });
  }, [rootTracks, exploreTracks, search]);

  return (
    <HomePageStyledWrapper>
      <Title>Your taste</Title>

      <TasteTilesStyledWrapper>
        <TasteTileStyledWrapper onClick={() => navigate("/liked")}>
          <TasteTileCoverStyledWrapper style={{ background: colors.primary }}>
            <FaHeart size={40} color={colors.white} />
          </TasteTileCoverStyledWrapper>
          <TasteTileNameStyledWrapper>Liked songs</TasteTileNameStyledWrapper>
        </TasteTileStyledWrapper>

        {playlists.map((playlist: any) => (
          <TasteTileStyledWrapper
            key={playlist.id}
            onClick={() => navigate(`/playlist/${playlist.id}`)}
          >
            <TasteTileCoverStyledWrapper
              $bgUrl={playlist?.tracks?.[0]?.trackCover}
            >
              {!playlist?.tracks?.[0]?.trackCover && (
                <FaMusic size={32} color={colors.gray} />
              )}
            </TasteTileCoverStyledWrapper>
            <TasteTileNameStyledWrapper>
              {playlist.name}
            </TasteTileNameStyledWrapper>
          </TasteTileStyledWrapper>
        ))}
      </TasteTilesStyledWrapper>

      {recentlyPlayed.length > 0 && (
        <>
          <Title>Recently played</Title>
          <TrackGridStyledWrapper>
            {recentlyPlayed.map((track: any, index: number) => (
              <TrackCard
                key={track.id}
                track={track}
                queue={recentlyPlayed}
                index={index}
              />
            ))}
          </TrackGridStyledWrapper>
        </>
      )}

      {trendingTracks.length > 0 && (
        <>
          <Title>Trending now</Title>
          <TrackGridStyledWrapper>
            {trendingTracks.map((track: any, index: number) => (
              <TrackCard
                key={track.id}
                track={track}
                queue={trendingTracks}
                index={index}
              />
            ))}
          </TrackGridStyledWrapper>
        </>
      )}

      <Title>Explore new</Title>

      <SearchInputStyledWrapper>
        <Input
          placeholder="Search by track or artist"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
      </SearchInputStyledWrapper>

      <TrackGridStyledWrapper>
        {filteredTracks.map((track: any, index: number) => (
          <TrackCard
            key={track.id}
            track={track}
            queue={filteredTracks}
            index={index}
          />
        ))}
      </TrackGridStyledWrapper>

      {!filteredTracks.length && (
        <EmptyStateStyledWrapper>No tracks found.</EmptyStateStyledWrapper>
      )}

      {showGenresModal && (
        <GenresModal
          onClose={() => setShowGenresModal(false)}
          autoCreatePlaylist
        />
      )}
    </HomePageStyledWrapper>
  );
});
