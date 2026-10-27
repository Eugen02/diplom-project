import React, { ReactElement, useState } from "react";

import {
  PlaylistItemDeleteButtonStyled,
  PlaylistItemInfoStyledWrapper,
  PlaylistItemNameStyledWrapper,
  PlaylistItemStyledWrapper,
  PlaylistItemTypeStyledWrapper,
} from "./PlaylistItem.styled";
import { PlaylistTypeEnum } from "../../../types/enums/PlaylistTypeEnum.enum";
import { useNavigate, useLocation } from "react-router-dom";
import { TrackCover } from "../TrackCover/TrackCover";
import { FaTrash } from "react-icons/fa";
import { ConfirmModal } from "../ConfirmModal/ConfirmModal";
import { playlistApi } from "../../../api/playlist.api";
import { usePlaylistStore } from "../../../hooks/usePlaylistStore";

interface PlaylistItemProps {
  id: string;
  coverUrl: string;
  playlistName: string;
  playlistType: PlaylistTypeEnum;
}

export const PlaylistTypeEnumToText = {
  [PlaylistTypeEnum.ALBUM]: "Album",
  [PlaylistTypeEnum.PLAYLIST]: "Playlist",
  [PlaylistTypeEnum.EP]: "Ep",
  [PlaylistTypeEnum.SINGLE]: "Single",
};

export const PlaylistItem = (props: PlaylistItemProps): ReactElement => {
  const { id, coverUrl, playlistName, playlistType } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { playlists, setPlaylists } = usePlaylistStore();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isActive = location.pathname === `/playlist/${id}`;

  const handleOpenPlaylist = (): void => {
    navigate(`/playlist/${id}`);
  };

  const handleDelete = async () => {
    await playlistApi.deletePlaylist(id);

    setPlaylists(playlists.filter((playlist: any) => playlist.id !== id));
    setIsConfirmingDelete(false);

    if (location.pathname === `/playlist/${id}`) {
      navigate("/");
    }
  };

  return (
    <>
      <PlaylistItemStyledWrapper $isActive={isActive} onClick={handleOpenPlaylist}>
        <TrackCover coverUrl={coverUrl} size={48} />

        <PlaylistItemInfoStyledWrapper>
          <PlaylistItemNameStyledWrapper $isActive={isActive}>
            {playlistName}
          </PlaylistItemNameStyledWrapper>

          <PlaylistItemTypeStyledWrapper>
            {PlaylistTypeEnumToText[playlistType]}
          </PlaylistItemTypeStyledWrapper>
        </PlaylistItemInfoStyledWrapper>

        <PlaylistItemDeleteButtonStyled
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirmingDelete(true);
          }}
        >
          <FaTrash />
        </PlaylistItemDeleteButtonStyled>
      </PlaylistItemStyledWrapper>

      {isConfirmingDelete && (
        <ConfirmModal
          title={`Delete "${playlistName}"?`}
          description="This can't be undone."
          onConfirm={handleDelete}
          onClose={() => setIsConfirmingDelete(false)}
        />
      )}
    </>
  );
};
