import React, { ReactElement, useEffect, useState } from "react";
import { FaMusic, FaTag, FaTrash } from "react-icons/fa";

import {
  DeletePlaylistButtonStyledWrapper,
  PlaylistCoverStyledWrapper,
  PlaylistGenreChipStyledWrapper,
  PlaylistGenresLabelStyledWrapper,
  PlaylistGenresRowStyledWrapper,
  PlaylistGenresSectionStyledWrapper,
  PlaylistInfoStyledWrapper,
  PlaylistMetaDotStyledWrapper,
  PlaylistMetaRowStyledWrapper,
  PlaylistNameStyledWrapper,
  PlaylistPageHeaderStyledWrapper,
  PlaylistPageStyledWrapper,
  PlaylistTypeStyledWrapper,
} from "./PlaylistPage.styled";
import { TrackCover } from "../../components/shared-components/TrackCover/TrackCover";
import { Title } from "../../components/shared-components/Title/Title";
import { PlaylistTypeEnumToText } from "../../components/shared-components/PlaylistItem/PlaylistItem";
import { PlaylistTypeEnum } from "../../types/enums/PlaylistTypeEnum.enum";
import { Track } from "../../components/shared-components/Track/Track";
import { ConfirmModal } from "../../components/shared-components/ConfirmModal/ConfirmModal";
import { colors } from "../../constants/colors";
import { playlistApi } from "../../api/playlist.api";
import { usePlaylistStore } from "../../hooks/usePlaylistStore";
import { useNavigate, useParams } from "react-router-dom";
import {
  MatchBadge,
  WhyPanel,
} from "../../components/composit-components/RecommendationExplanation/RecommendationExplanation";

interface PlaylistPageProps {}

export const PlaylistPage = (props: PlaylistPageProps): ReactElement => {
  const {} = props;

  const [playlist, setPlaylists] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendedTracks, setRecommendedTracks] = useState<any>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [openExplanationId, setOpenExplanationId] = useState<string | null>(
    null
  );
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playlists, setPlaylists: setAllPlaylists } = usePlaylistStore();

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      const playlist = await playlistApi.getPlaylistById(playlistId);

      setPlaylists(playlist);
      setIsLoading(false);

      const recommendedTracks = await playlistApi.getRecommendationSummary(
        playlistId
      );

      setRecommendedTracks(recommendedTracks);
    };

    fetchPlaylists();
  }, [playlistId]);

  const handleDeletePlaylist = async () => {
    if (!playlistId) {
      return;
    }

    await playlistApi.deletePlaylist(playlistId);

    setAllPlaylists(
      playlists.filter((playlist: any) => playlist.id !== playlistId)
    );
    navigate("/");
  };

  const handleTrackAddedToPlaylist = (
    addedPlaylistId: string,
    track: any
  ) => {
    if (addedPlaylistId !== playlistId) {
      return;
    }

    const addedTrackId = track.id || track._id;

    setPlaylists((prev: any) => ({
      ...prev,
      tracks: [track, ...(prev.tracks || [])],
    }));

    setRecommendedTracks((prev: any) =>
      (prev || []).filter((t: any) => (t.id || t._id) !== addedTrackId)
    );
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlistId) {
      return;
    }

    await playlistApi.removeTrackFromPlaylist(playlistId, trackId);

    setPlaylists((prev: any) => ({
      ...prev,
      tracks: (prev.tracks || []).filter(
        (track: any) => (track.id || track._id) !== trackId
      ),
    }));
  };

  if (isLoading) {
    return <></>;
  }

  const {
    name: playlistName,
    type: playlistType,
    coverUrl,
    tracks = [],
    genres = [],
  } = playlist || {};

  return (
    <PlaylistPageStyledWrapper>
      <PlaylistPageHeaderStyledWrapper>
        <PlaylistCoverStyledWrapper>
          <TrackCover
            size={200}
            coverUrl={coverUrl || tracks?.[0]?.trackCover || ""}
          />
        </PlaylistCoverStyledWrapper>

        <PlaylistInfoStyledWrapper>
          <PlaylistNameStyledWrapper>{playlistName}</PlaylistNameStyledWrapper>

          <PlaylistMetaRowStyledWrapper>
            <FaMusic />
            <PlaylistTypeStyledWrapper>
              {PlaylistTypeEnumToText[playlistType as PlaylistTypeEnum]}
            </PlaylistTypeStyledWrapper>
            <PlaylistMetaDotStyledWrapper>•</PlaylistMetaDotStyledWrapper>
            <span>
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </span>
          </PlaylistMetaRowStyledWrapper>

          {genres.length > 0 && (
            <PlaylistGenresSectionStyledWrapper>
              <PlaylistGenresLabelStyledWrapper>
                <FaTag />
                Generated from genres
              </PlaylistGenresLabelStyledWrapper>

              <PlaylistGenresRowStyledWrapper>
                {genres.map((genre: string) => (
                  <PlaylistGenreChipStyledWrapper key={genre}>
                    {genre}
                  </PlaylistGenreChipStyledWrapper>
                ))}
              </PlaylistGenresRowStyledWrapper>
            </PlaylistGenresSectionStyledWrapper>
          )}

          <DeletePlaylistButtonStyledWrapper
            onClick={() => setIsConfirmingDelete(true)}
          >
            <FaTrash size={12} />
            Delete playlist
          </DeletePlaylistButtonStyledWrapper>
        </PlaylistInfoStyledWrapper>
      </PlaylistPageHeaderStyledWrapper>

      <Title style={{ fontSize: 20, marginTop: 20 }}>Tracks</Title>
      <div
        style={{
          marginTop: 10,
          padding: 25,
          background: colors.darkGray,
          borderRadius: 4,
        }}
      >
        {tracks.map((track: any, index: number) => (
          <Track
            key={track.id}
            trackId={track.id || track._id}
            coverUrl={track.trackCover}
            trackName={track.trackName}
            artists={track.artists}
            track={track}
            queue={tracks}
            index={index}
            onRemove={() => handleRemoveTrack(track.id || track._id)}
          />
        ))}
      </div>

      <Title style={{ fontSize: 20, marginTop: 20 }}>
        Recommended based on this playlist
      </Title>
      <p style={{ marginTop: 4, fontSize: 13, color: colors.gray }}>
        Sorted by similarity to this playlist. Click a match badge to see why a
        track was recommended.
      </p>
      <div
        style={{
          marginTop: 10,
          padding: 25,
          background: colors.darkGray,
          borderRadius: 4,
        }}
      >
        {recommendedTracks.map((track: any, index: number) => {
          const trackId = track.id || track._id;
          const isExplanationOpen = openExplanationId === trackId;

          return (
            <React.Fragment key={trackId}>
              <Track
                trackId={trackId}
                coverUrl={track.trackCover}
                trackName={track.trackName}
                artists={track.artists}
                track={track}
                queue={recommendedTracks}
                index={index}
                onAddedToPlaylist={(addedPlaylistId) =>
                  handleTrackAddedToPlaylist(addedPlaylistId, track)
                }
                badge={
                  track.explanation && (
                    <MatchBadge
                      explanation={track.explanation}
                      isOpen={isExplanationOpen}
                      onToggle={() =>
                        setOpenExplanationId(isExplanationOpen ? null : trackId)
                      }
                    />
                  )
                }
              />
              {isExplanationOpen && track.explanation && (
                <WhyPanel explanation={track.explanation} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isConfirmingDelete && (
        <ConfirmModal
          title={`Delete "${playlistName}"?`}
          description="This can't be undone."
          onConfirm={handleDeletePlaylist}
          onClose={() => setIsConfirmingDelete(false)}
        />
      )}
    </PlaylistPageStyledWrapper>
  );
};
