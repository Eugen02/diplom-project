import React, { ReactElement, useEffect, useState } from "react";

import {
  BrandStyled,
  CreatePlaylistButtonStyled,
  LeftSidebarStyledWrapper,
  LikedSongsStyledWrapper,
  ProfileButtonStyled,
  SectionLabelStyled,
  SidebarAvatarStyled,
} from "./LeftSidebar.styled";
import { PlaylistItem } from "../../shared-components/PlaylistItem/PlaylistItem";
import { colors } from "../../../constants/colors";
import { useNavigate } from "react-router-dom";
import { playlistApi } from "../../../api/playlist.api";
import { trackApi } from "../../../api/requests/track.api";
import Button from "../../shared-components/Button/Button";
import Modal from "../../shared-components/Modal/Modal";
import { Title } from "../../shared-components/Title/Title";
import { Input } from "../../shared-components/Input/Input";
import { usePlaylistStore } from "../../../hooks/usePlaylistStore";
import { observer } from "mobx-react-lite";
import { useUserStore } from "../../../hooks/useUserStore";
import { FaHeart, FaPlus, FaTimes } from "react-icons/fa";
import { GenreCheckboxGrid } from "../GenresModal/GenreCheckboxGrid";
import { GenresModalCloseButtonStyled } from "../GenresModal/GenresModal.styled";

enum CreatePlaylistModeEnum {
  PERSONAL = "PERSONAL",
  RECOMMENDED = "RECOMMENDED",
}

export const LeftSidebar = observer((): ReactElement => {
  const navigate = useNavigate();
  const { playlists = [], setPlaylists } = usePlaylistStore();
  const { user } = useUserStore();
  const { name, surname, login, avatarUrl } = user || {};
  const fullName = [name, surname].filter(Boolean).join(" ");
  const likedCount = user?.likedTracks?.length || 0;

  const [isModalOpen, setModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [createMode, setCreateMode] = useState(CreatePlaylistModeEnum.PERSONAL);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const resetCreateModalState = () => {
    setPlaylistName("");
    setCreateMode(CreatePlaylistModeEnum.PERSONAL);
    setSelectedGenres([]);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    resetCreateModalState();
  };
  const handlePlaylistNameChange = (e: any) => setPlaylistName(e.target.value);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleCreatePlaylist = async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const createdPlaylist =
        createMode === CreatePlaylistModeEnum.RECOMMENDED
          ? await playlistApi.createRecommendedPlaylist(
              playlistName || "Made for you",
              selectedGenres
            )
          : await playlistApi.createPlaylist(playlistName);

      if (createdPlaylist) {
        setPlaylists([...playlists, createdPlaylist]);
      }

      handleCloseModal();
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      const playlists = await playlistApi.getAllPlaylists();

      setPlaylists(playlists);
    };

    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (!isModalOpen || genres.length > 0) {
      return;
    }

    const fetchGenres = async () => {
      const genres = await trackApi.getGenres();

      setGenres(genres);
    };

    fetchGenres();
  }, [isModalOpen, genres.length]);

  return (
    <LeftSidebarStyledWrapper>
      <BrandStyled onClick={() => navigate("/")}>
        Tune<span>print</span>
      </BrandStyled>

      <ProfileButtonStyled onClick={() => navigate("/account")}>
        <SidebarAvatarStyled>
          {avatarUrl ? <img src={avatarUrl} alt={fullName} /> : (name || "?")[0]}
        </SidebarAvatarStyled>
        <div>
          <strong>{fullName}</strong>
          <span>@{login}</span>
        </div>
      </ProfileButtonStyled>

      <CreatePlaylistButtonStyled onClick={handleOpenModal}>
        <FaPlus size={12} /> Create playlist
      </CreatePlaylistButtonStyled>

      <SectionLabelStyled>Your library</SectionLabelStyled>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <LikedSongsStyledWrapper onClick={() => navigate("/liked")}>
          <div>
            <FaHeart />
          </div>
          <div>
            <strong>Liked songs</strong>
            <span>
              {likedCount} {likedCount === 1 ? "song" : "songs"}
            </span>
          </div>
        </LikedSongsStyledWrapper>

        {playlists.map((playlist: any) => (
          <PlaylistItem
            key={playlist.id}
            id={playlist.id}
            coverUrl={
              playlist.coverUrl || playlist?.tracks?.[0]?.trackCover || ""
            }
            playlistName={playlist.name}
            playlistType={playlist.type}
          />
        ))}
      </div>

      {isModalOpen && (
        <Modal
          onClose={handleCloseModal}
          width={560}
          height={createMode === CreatePlaylistModeEnum.RECOMMENDED ? 560 : 300}
        >
          <GenresModalCloseButtonStyled onClick={handleCloseModal}>
            <FaTimes />
          </GenresModalCloseButtonStyled>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Title>Create playlist</Title>

            <Input
              type="text"
              placeholder="Playlist name"
              onChange={handlePlaylistNameChange}
              value={playlistName}
              style={{
                marginTop: 20,
                width: "100%",
              }}
            />

            <div
              style={{
                display: "flex",
                width: "100%",
                gap: 8,
                marginTop: 14,
              }}
            >
              <Button
                variant={
                  createMode === CreatePlaylistModeEnum.PERSONAL
                    ? "primary"
                    : "secondary"
                }
                style={{ flex: 1, margin: 0 }}
                onClick={() => setCreateMode(CreatePlaylistModeEnum.PERSONAL)}
              >
                Your playlist
              </Button>
              <Button
                variant={
                  createMode === CreatePlaylistModeEnum.RECOMMENDED
                    ? "primary"
                    : "secondary"
                }
                style={{ flex: 1, margin: 0 }}
                onClick={() =>
                  setCreateMode(CreatePlaylistModeEnum.RECOMMENDED)
                }
              >
                Recommended
              </Button>
            </div>

            {createMode === CreatePlaylistModeEnum.RECOMMENDED && (
              <>
                <p
                  style={{
                    color: colors.gray,
                    alignSelf: "flex-start",
                    marginBottom: 0,
                  }}
                >
                  Pick genres to seed ~40 recommended tracks
                </p>

                <GenreCheckboxGrid
                  genres={genres}
                  selected={selectedGenres}
                  onToggle={toggleGenre}
                />
              </>
            )}

            <Button
              style={{ width: "100%", marginTop: 20 }}
              onClick={handleCreatePlaylist}
              disabled={
                isCreating ||
                (createMode === CreatePlaylistModeEnum.RECOMMENDED &&
                  selectedGenres.length === 0)
              }
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </Modal>
      )}
    </LeftSidebarStyledWrapper>
  );
});
