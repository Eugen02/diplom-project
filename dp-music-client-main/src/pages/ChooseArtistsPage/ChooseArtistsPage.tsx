import React, { ReactElement, useState } from "react";
import {
  ArtistAvatarStyled,
  ArtistsContainerStyled,
  ChooseArtistsPageContainerStyled,
} from "./ChooseArtistsPage.styled";
import { Title } from "../../components/shared-components/Title/Title";
import { colors } from "../../constants/colors";
import Button from "../../components/shared-components/Button/Button";
import { Input } from "../../components/shared-components/Input/Input";
import { useNavigate } from "react-router-dom";

const ARTISTS = [
  {
    id: "1",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "2",
    name: "NF",
    avatarUrl: "https://www.cchsoracle.com/wp-content/uploads/2021/03/NF.jpg",
  },
  {
    id: "3",
    name: "Blink-182",
    avatarUrl:
      "https://cdns-images.dzcdn.net/images/artist/3c60337b3a7cf8d3740bcea4c277f4e1/500x500.jpg",
  },
  {
    id: "4",
    name: "Jery Heil",
    avatarUrl:
      "https://yt3.googleusercontent.com/UgYk4wdrYEj-YHoKKTaGiWD-u5Qyi27_-QIcYWzf9CcScrX-KPq3vMbPZpdNoFIfne96JvbEOQ=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "5",
    name: "The Black Keys",
    avatarUrl:
      "https://media.npr.org/assets/img/2014/05/07/the_black_keys-23224d1c385198efbccf3a1d98028858ca1fc774.jpg",
  },
  {
    id: "6",
    name: "Imagine Dradons",
    avatarUrl:
      "https://i.scdn.co/image/ab6761610000e5eb920dc1f617550de8388f368e",
  },
  {
    id: "7",
    name: "A Day To Remember",
    avatarUrl: "https://photos.bandsintown.com/large/12579448.jpeg",
  },
  {
    id: "8",
    name: "Adele",
    avatarUrl: "https://upload.wikimedia.org/wikipedia/ru/7/76/Adele_-_30.png",
  },
  {
    id: "9",
    name: "Ed Sheeran",
    avatarUrl:
      "https://i1.sndcdn.com/avatars-R5BYCTU97gi7aUEs-iT6Cng-t500x500.jpg",
  },
  {
    id: "10",
    name: "Drake",
    avatarUrl:
      "https://imageio.forbes.com/specials-images/imageserve/5ed578988b3c370006234c35/0x0.jpg?format=jpg&crop=1031,1031,x43,y49,safe&height=416&width=416&fit=bounds",
  },
  {
    id: "11",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "12",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "13",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "14",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "15",
    name: "Eminem",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/APkrFKa9UGCuQ1IgMpmCGrWZp85Z0fEM1Rlp7NCRxdtLIw=s900-c-k-c0x00ffffff-no-rj",
  },
];

const ChooseArtistsPageFooter = ({ selected }: any): ReactElement => {
  const navigate = useNavigate();

  const handleNext = () => {
    // Send selected artists to serve and get recommendations

    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.darkGray,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "10px 120px",
        }}
      >
        <Button
          variant="secondary"
          style={{ width: 200, border: `${colors.primary} 1px solid` }}
        >
          Back
        </Button>
        <Title
          style={{
            fontSize: 20,
          }}
        >
          Selected {selected} of 3
        </Title>
        <Button style={{ width: 200 }} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const ChooseArtistsPageHeader = (): ReactElement => {
  return (
    <>
      <Title
        style={{
          marginBottom: 10,
          fontSize: 36,
        }}
      >
        Welcome
      </Title>
      <Title
        style={{
          marginBottom: 20,
          fontSize: 26,
        }}
      >
        Choose{" "}
        <span
          style={{
            color: colors.primary,
          }}
        >
          your
        </span>{" "}
        favourite{" "}
        <span
          style={{
            color: colors.primary,
          }}
        >
          Artists
        </span>
      </Title>

      <Input
        placeholder="Search"
        style={{
          width: "60%",
          marginBottom: 20,
        }}
      />
    </>
  );
};

export const ChooseArtistsPage = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      if (selected.length === 3) {
        return;
      }

      setSelected([...selected, id]);
    }
  };

  return (
    <ChooseArtistsPageContainerStyled>
      <ChooseArtistsPageHeader />

      <ArtistsContainerStyled>
        {ARTISTS.map((artist) => (
          <div
            style={{
              width: 160,
              textAlign: "center",
              margin: "20px 0 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ArtistAvatarStyled
              src={artist.avatarUrl}
              onClick={() => handleSelect(artist.id)}
              $isSelected={selected.includes(artist.id)}
              $isDisabled={
                selected.length === 3 && !selected.includes(artist.id)
              }
            />
            <p>{artist.name}</p>
          </div>
        ))}
      </ArtistsContainerStyled>

      <ChooseArtistsPageFooter selected={selected.length} />
    </ChooseArtistsPageContainerStyled>
  );
};
