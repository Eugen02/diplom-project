import React, { ReactElement } from "react";

import {
  ArtistsListStyledWrapper,
  TractArtistStyledWrapper,
} from "./Artists.styled";
import { ArtistInterface } from "../../../types/interfaces/Artist.interface";
import { toJS } from "mobx";

interface ArtistsProps {
  artists: ArtistInterface[];
}

export const Artists = (props: ArtistsProps): ReactElement => {
  const { artists } = props;

  return (
    <ArtistsListStyledWrapper>
      {artists.map(({ id, name }: ArtistInterface) => (
        <TractArtistStyledWrapper key={id}>{name}</TractArtistStyledWrapper>
      ))}
    </ArtistsListStyledWrapper>
  );
};
