import React, { ReactElement } from "react";
import {
  GenreOptionStyled,
  GenresGridStyled,
} from "./GenresModal.styled";

type GenreCheckboxGridProps = {
  genres: string[];
  selected: string[];
  onToggle: (genre: string) => void;
};

export const GenreCheckboxGrid = ({
  genres,
  selected,
  onToggle,
}: GenreCheckboxGridProps): ReactElement => {
  return (
    <GenresGridStyled>
      {genres.map((genre) => (
        <GenreOptionStyled key={genre} $isSelected={selected.includes(genre)}>
          <input
            type="checkbox"
            checked={selected.includes(genre)}
            onChange={() => onToggle(genre)}
          />
          {genre}
        </GenreOptionStyled>
      ))}
    </GenresGridStyled>
  );
};
