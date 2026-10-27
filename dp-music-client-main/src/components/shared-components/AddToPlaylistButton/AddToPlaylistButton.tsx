import React, { ReactElement, useState } from "react";
import { observer } from "mobx-react-lite";
import { FaPlus } from "react-icons/fa";
import { usePlaylistStore } from "../../../hooks/usePlaylistStore";
import { playlistApi } from "../../../api/playlist.api";
import { ClickOutside } from "../ClickOutside/ClickOutside";
import {
  AddToPlaylistStyledWrapper,
  AddToPlaylistToggleStyled,
  PlaylistOptionStyled,
  PlaylistsListStyledWrapper,
} from "./AddToPlaylistButton.styled";

type AddToPlaylistButtonProps = {
  trackId: string;
  onAdd?: (playlistId: string) => void;
};

export const AddToPlaylistButton = observer(
  ({ trackId, onAdd }: AddToPlaylistButtonProps): ReactElement => {
    const { playlists = [], setPlaylists } = usePlaylistStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleAdd = async (playlistId: string) => {
      await playlistApi.addTrackToPlaylist(playlistId, trackId);

      const updatedPlaylists = await playlistApi.getAllPlaylists();
      setPlaylists(updatedPlaylists);
      setIsOpen(false);
      onAdd?.(playlistId);
    };

    return (
      <ClickOutside onClickOutside={() => setIsOpen(false)}>
        <AddToPlaylistStyledWrapper>
          {isOpen && (
            <PlaylistsListStyledWrapper>
              {playlists.length === 0 && (
                <PlaylistOptionStyled $isDisabled>
                  No playlists yet
                </PlaylistOptionStyled>
              )}

              {playlists.map((playlist: any) => {
                const isAlreadyAdded = (playlist.tracks || []).some(
                  (track: any) => (track.id || track._id) === trackId
                );

                return (
                  <PlaylistOptionStyled
                    key={playlist.id}
                    $isDisabled={isAlreadyAdded}
                    onClick={() => !isAlreadyAdded && handleAdd(playlist.id)}
                  >
                    {playlist.name}
                    {isAlreadyAdded ? " ✓" : ""}
                  </PlaylistOptionStyled>
                );
              })}
            </PlaylistsListStyledWrapper>
          )}

          <AddToPlaylistToggleStyled onClick={() => setIsOpen(!isOpen)}>
            <FaPlus />
          </AddToPlaylistToggleStyled>
        </AddToPlaylistStyledWrapper>
      </ClickOutside>
    );
  }
);
