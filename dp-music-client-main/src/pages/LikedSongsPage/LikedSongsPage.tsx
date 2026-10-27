import React, { ReactElement, useEffect, useState } from "react";

import {
  PlaylistNameStyledWrapper,
  PlaylistPageHeaderStyledWrapper,
  PlaylistPageStyledWrapper,
  PlaylistTypeStyledWrapper,
} from "./LikedSongsPage.styled";
import { TrackCover } from "../../components/shared-components/TrackCover/TrackCover";
import { PlaylistTypeEnumToText } from "../../components/shared-components/PlaylistItem/PlaylistItem";
import { PlaylistTypeEnum } from "../../types/enums/PlaylistTypeEnum.enum";
import { Track } from "../../components/shared-components/Track/Track";
import { colors } from "../../constants/colors";
import { observer } from "mobx-react-lite";
import { useUserStore } from "../../hooks/useUserStore";
import { FaHeart } from "react-icons/fa";
import { toJS } from "mobx";

export const LikedSongsPage = observer((): ReactElement => {
  const { user } = useUserStore();
  const { likedTracks = [] } = user || {};

  console.log("likedTracks");
  console.log(toJS(likedTracks));

  return (
    <PlaylistPageStyledWrapper>
      <PlaylistPageHeaderStyledWrapper>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 4,
            background: colors.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaHeart size={50} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 30,
          }}
        >
          <PlaylistNameStyledWrapper>Liked songs</PlaylistNameStyledWrapper>
          <PlaylistTypeStyledWrapper>
            {PlaylistTypeEnumToText[PlaylistTypeEnum.PLAYLIST]}
          </PlaylistTypeStyledWrapper>
        </div>
      </PlaylistPageHeaderStyledWrapper>

      <div
        style={{
          marginTop: 10,
          padding: 25,
          background: colors.darkGray,
          borderRadius: 4,
        }}
      >
        {likedTracks.map((track: any, index: number) => (
          <Track
            key={track.id}
            trackId={track.id}
            coverUrl={track.trackCover}
            trackName={track.trackName}
            artists={track.artists}
            track={track}
            queue={likedTracks}
            index={index}
          />
        ))}
      </div>
    </PlaylistPageStyledWrapper>
  );
});
