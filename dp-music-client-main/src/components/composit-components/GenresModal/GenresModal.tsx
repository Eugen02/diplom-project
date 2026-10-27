import React, { ReactElement, useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import Modal from "../../shared-components/Modal/Modal";
import { Title } from "../../shared-components/Title/Title";
import Button from "../../shared-components/Button/Button";
import { trackApi } from "../../../api/requests/track.api";
import { userApi } from "../../../api/user.api";
import { playlistApi } from "../../../api/playlist.api";
import { useUserStore } from "../../../hooks/useUserStore";
import { usePlaylistStore } from "../../../hooks/usePlaylistStore";
import { GenreCheckboxGrid } from "./GenreCheckboxGrid";
import { GenresModalCloseButtonStyled } from "./GenresModal.styled";

type GenresModalProps = {
  onClose: () => void;
  // Only the post-signup flow should auto-generate a starter playlist -
  // editing genres later (account page) must not spawn a new playlist
  // every time.
  autoCreatePlaylist?: boolean;
};

export const GenresModal = ({
  onClose,
  autoCreatePlaylist = false,
}: GenresModalProps): ReactElement => {
  const { user, setCurrentUser } = useUserStore();
  const { playlists, setPlaylists } = usePlaylistStore();
  const [genres, setGenres] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(
    user?.favoriteGenres || []
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await trackApi.getGenres();

      setGenres(genres);
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre: string) => {
    if (selected.includes(genre)) {
      setSelected(selected.filter((item) => item !== genre));
    } else {
      setSelected([...selected, genre]);
    }
  };

  const handleDone = async () => {
    setIsSaving(true);

    const updatedUser = await userApi.updateFavoriteGenres(selected);

    setCurrentUser({ ...user, ...updatedUser });

    if (autoCreatePlaylist && selected.length > 0) {
      const createdPlaylist = await playlistApi.createRecommendedPlaylist(
        "Made for you",
        selected
      );

      if (createdPlaylist) {
        setPlaylists([...playlists, createdPlaylist]);
      }
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <Modal onClose={onClose} width={560} height={520}>
      <GenresModalCloseButtonStyled onClick={onClose}>
        <FaTimes />
      </GenresModalCloseButtonStyled>

      <Title style={{ fontSize: 22 }}>Pick your favourite genres</Title>
      <p style={{ color: "#959D99", marginTop: 0 }}>
        We use this to tune your recommendations. You can skip this.
      </p>

      <GenreCheckboxGrid
        genres={genres}
        selected={selected}
        onToggle={toggleGenre}
      />

      <Button
        style={{ width: "100%", margin: "10px 0 0" }}
        onClick={handleDone}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Done"}
      </Button>
    </Modal>
  );
};
