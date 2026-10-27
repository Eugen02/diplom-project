import React, { ReactElement, useEffect, useRef, useState } from "react";
import {
  FaArrowRight,
  FaCamera,
  FaChartBar,
  FaCompass,
  FaHandHoldingUsd,
  FaHeadphones,
  FaHeart,
  FaLayerGroup,
  FaListUl,
  FaMusic,
  FaPen,
  FaPlay,
  FaPlus,
  FaSeedling,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { UserStatsInterface } from "../../types/interfaces/Stats.interface";
import { Title } from "../../components/shared-components/Title/Title";
import Button from "../../components/shared-components/Button/Button";
import { Input } from "../../components/shared-components/Input/Input";
import Modal from "../../components/shared-components/Modal/Modal";
import { useUserStore } from "../../hooks/useUserStore";
import { usePlaylistStore } from "../../hooks/usePlaylistStore";
import { usePlayerStore } from "../../hooks/usePlayerStore";
import { GenresModal } from "../../components/composit-components/GenresModal/GenresModal";
import { normalizedEntropy } from "../../components/shared-components/Charts/statsMath";
import { userApi } from "../../api/user.api";
import { colors } from "../../constants/colors";
import {
  AchievementProgressStyled,
  AchievementStyled,
  AchievementsGridStyled,
  AvatarStyledWrapper,
  AvatarUploadButtonStyled,
  CardHeaderStyledWrapper,
  CardStyledWrapper,
  CardSubtitleStyled,
  ChipStyledWrapper,
  ChipsRowStyledWrapper,
  DangerZoneStyledWrapper,
  DetailsButtonStyled,
  EditIconButtonStyled,
  EmptyStateStyledWrapper,
  GenreBarRowStyled,
  GenreBarTrackStyled,
  GridStyledWrapper,
  HeroCardStyledWrapper,
  HeroStatsRowStyled,
  LikedCoverStyled,
  MiniStatStyledWrapper,
  MiniStatsGridStyledWrapper,
  PersonalityStyled,
  PlayCountStyled,
  PlaylistCardStyled,
  PlaylistGridStyled,
  ProfileRowStyledWrapper,
  RankStyled,
  SubheadingStyled,
  SuggestChipStyled,
  TrackListRowStyled,
  TrackListStyled,
  UserPageContentStyled,
  UserPageStyledWrapper,
} from "./UserPage.styled";

const RECENTLY_PLAYED_LIMIT = 5;
const GENRE_SUGGESTIONS_LIMIT = 3;

const formatMemberSince = (createdAt?: string) => {
  if (!createdAt) {
    return null;
  }

  return new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
};

const AVATAR_MAX_SIZE = 300;

const resizeImageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Could not read image"));

      image.onload = () => {
        const scale = Math.min(
          1,
          AVATAR_MAX_SIZE / Math.max(image.width, image.height)
        );
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};

const getListeningPersonality = (stats: UserStatsInterface) => {
  const genresPlayed = stats.playsByGenre.length;
  const diversity = normalizedEntropy(stats.playsByGenre.map((row) => row.plays));
  const topGenre = stats.summary.topGenre;

  if (genresPlayed <= 1 || diversity < 0.4) {
    return {
      icon: <FaStar />,
      title: "Genre loyalist",
      description: `You know what you like — ${topGenre} leads by a mile.`,
    };
  }

  if (diversity < 0.75) {
    return {
      icon: <FaLayerGroup />,
      title: "Balanced listener",
      description: `A steady mix of ${genresPlayed} genres, with ${topGenre} on top.`,
    };
  }

  return {
    icon: <FaCompass />,
    title: "Genre explorer",
    description: `You spread your listening evenly across ${genresPlayed} genres.`,
  };
};

const artistNames = (track: any) =>
  (track.artists || []).map((artist: any) => artist.name).join(", ") ||
  track.artistName ||
  "";

export const UserPage = observer((): ReactElement => {
  const { user, setCurrentUser, logout } = useUserStore();
  const { playlists } = usePlaylistStore();
  const { setQueue } = usePlayerStore();
  const { name, surname, login, avatarUrl, favoriteGenres = [] } = user || {};
  const likedCount = user?.likedTracks?.length || 0;
  const memberSince = formatMemberSince((user as any)?.createdAt);

  const [isEditingGenres, setIsEditingGenres] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name || "");
  const [surnameDraft, setSurnameDraft] = useState(surname || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [addingGenre, setAddingGenre] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStatsInterface | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    userApi
      .getStats()
      .then(({ user }) => setStats(user))
      .catch(() => {});

    userApi
      .getRecentlyPlayed(RECENTLY_PLAYED_LIMIT)
      .then(setRecentlyPlayed)
      .catch(() => {});
  }, []);

  const handleOpenEditName = () => {
    setNameDraft(name || "");
    setSurnameDraft(surname || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      return;
    }

    setIsSavingName(true);

    const updatedUser = await userApi.updateProfile({
      name: nameDraft.trim(),
      surname: surnameDraft.trim(),
    });

    setCurrentUser({ ...user, ...updatedUser });
    setIsSavingName(false);
    setIsEditingName(false);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const dataUrl = await resizeImageToDataUrl(file);

      const updatedUser = await userApi.updateProfile({
        name: name || "",
        surname: surname || "",
        avatarUrl: dataUrl,
      });

      setCurrentUser({ ...user, ...updatedUser });
    } finally {
      setIsUploadingAvatar(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddFavoriteGenre = async (genre: string) => {
    setAddingGenre(genre);

    try {
      const updatedUser = await userApi.updateFavoriteGenres([
        ...favoriteGenres,
        genre,
      ]);

      setCurrentUser({ ...user, ...updatedUser });
    } finally {
      setAddingGenre(null);
    }
  };

  const fullName = [name, surname].filter(Boolean).join(" ");

  const totalPlays = stats?.summary.totalPlays || 0;
  const genresPlayed = stats?.playsByGenre.length || 0;
  const playsOf = (genre: string) =>
    stats?.playsByGenre.find((row) => row.genre === genre)?.plays || 0;
  const favoritesShare = totalPlays
    ? favoriteGenres.reduce((sum, genre) => sum + playsOf(genre), 0) / totalPlays
    : 0;
  const genreSuggestions = (stats?.playsByGenre || [])
    .filter((row) => !favoriteGenres.includes(row.genre))
    .slice(0, GENRE_SUGGESTIONS_LIMIT);

  const personality = stats && totalPlays ? getListeningPersonality(stats) : null;

  const topTracksQueue = (stats?.topTracks || []).map((track) => ({
    ...track,
    durationMs: track.durationMs || 0,
  }));

  const achievements = [
    {
      icon: <FaPlay />,
      title: "First spin",
      description: "Play your first track.",
      current: totalPlays,
      target: 1,
    },
    {
      icon: <FaHeadphones />,
      title: "Regular listener",
      description: "Reach 50 plays.",
      current: totalPlays,
      target: 50,
    },
    {
      icon: <FaListUl />,
      title: "Curator",
      description: "Create 3 playlists.",
      current: playlists.length,
      target: 3,
    },
    {
      icon: <FaCompass />,
      title: "Genre explorer",
      description: "Listen to 5 different genres.",
      current: genresPlayed,
      target: 5,
    },
    {
      icon: <FaHeart />,
      title: "Big heart",
      description: "Like 10 songs.",
      current: likedCount,
      target: 10,
    },
    {
      icon: <FaHandHoldingUsd />,
      title: "Supporter",
      description: "Hear 10 ads that keep the music free.",
      current: stats?.summary.adImpressions || 0,
      target: 10,
    },
  ];
  const unlockedCount = achievements.filter(
    (achievement) => achievement.current >= achievement.target
  ).length;

  return (
    <UserPageStyledWrapper>
      <UserPageContentStyled>
        <Title>Account</Title>

        <HeroCardStyledWrapper>
          <ProfileRowStyledWrapper>
            <AvatarStyledWrapper $hasImage={Boolean(avatarUrl)}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} />
              ) : (
                (name || "?")[0]
              )}

              <AvatarUploadButtonStyled title="Change photo">
                <FaCamera size={14} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </AvatarUploadButtonStyled>
            </AvatarStyledWrapper>

            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Title style={{ fontSize: 26, margin: 0, color: colors.white }}>
                  {fullName}
                </Title>
                <EditIconButtonStyled onClick={handleOpenEditName}>
                  <FaPen size={12} />
                </EditIconButtonStyled>
              </div>

              <p style={{ color: "rgba(255, 255, 255, 0.85)", marginTop: 4 }}>
                @{login}
                {memberSince && (
                  <span style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                    {" "}
                    · Member since {memberSince}
                  </span>
                )}
              </p>

              <HeroStatsRowStyled>
                <span>
                  <FaListUl size={11} /> <b>{playlists.length}</b> playlists
                </span>
                <span>
                  <FaHeart size={11} /> <b>{likedCount}</b> liked songs
                </span>
                <span>
                  <FaHeadphones size={11} /> <b>{totalPlays}</b> plays
                </span>
                <span>
                  <FaCompass size={11} /> <b>{genresPlayed}</b> genres explored
                </span>
              </HeroStatsRowStyled>
            </div>
          </ProfileRowStyledWrapper>
        </HeroCardStyledWrapper>

        <GridStyledWrapper>
          <CardStyledWrapper style={{ marginBottom: 0 }}>
            <CardHeaderStyledWrapper>
              <Title style={{ fontSize: 18, margin: 0 }}>Favourite genres</Title>
              <Button
                variant="secondary"
                style={{ margin: 0, padding: "6px 14px" }}
                onClick={() => setIsEditingGenres(true)}
              >
                Edit
              </Button>
            </CardHeaderStyledWrapper>

            {favoriteGenres.length === 0 ? (
              <p style={{ color: colors.gray }}>
                No genres selected yet — click Edit to pick some.
              </p>
            ) : (
              <ChipsRowStyledWrapper>
                {favoriteGenres.map((genre) => (
                  <ChipStyledWrapper key={genre}>{genre}</ChipStyledWrapper>
                ))}
              </ChipsRowStyledWrapper>
            )}

            {totalPlays > 0 && favoriteGenres.length > 0 && (
              <>
                <SubheadingStyled>
                  How much you actually play them ·{" "}
                  {Math.round(favoritesShare * 100)}% of your plays
                </SubheadingStyled>
                {favoriteGenres.map((genre) => {
                  const share = playsOf(genre) / totalPlays;

                  return (
                    <GenreBarRowStyled key={genre}>
                      <span>{genre}</span>
                      <GenreBarTrackStyled>
                        <div style={{ width: `${share * 100}%` }} />
                      </GenreBarTrackStyled>
                      <span>{Math.round(share * 100)}%</span>
                    </GenreBarRowStyled>
                  );
                })}
              </>
            )}

            {genreSuggestions.length > 0 && (
              <>
                <SubheadingStyled>You play these a lot — add them?</SubheadingStyled>
                <ChipsRowStyledWrapper>
                  {genreSuggestions.map((row) => (
                    <SuggestChipStyled
                      key={row.genre}
                      disabled={addingGenre !== null}
                      onClick={() => handleAddFavoriteGenre(row.genre)}
                    >
                      <FaPlus size={10} />
                      {row.genre}
                      <span style={{ color: colors.gray }}>· {row.plays}</span>
                    </SuggestChipStyled>
                  ))}
                </ChipsRowStyledWrapper>
              </>
            )}
          </CardStyledWrapper>

          <CardStyledWrapper style={{ marginBottom: 0 }}>
            <CardHeaderStyledWrapper>
              <Title style={{ fontSize: 18, margin: 0 }}>
                Listening statistics
              </Title>
            </CardHeaderStyledWrapper>

            {personality && (
              <PersonalityStyled>
                <div>{personality.icon}</div>
                <div>
                  <strong>{personality.title}</strong>
                  <span>{personality.description}</span>
                </div>
              </PersonalityStyled>
            )}

            {stats && totalPlays > 0 ? (
              <MiniStatsGridStyledWrapper>
                <MiniStatStyledWrapper>
                  <strong>{totalPlays}</strong>
                  <span>Total plays</span>
                </MiniStatStyledWrapper>
                <MiniStatStyledWrapper>
                  <strong>{stats.summary.uniqueTracks}</strong>
                  <span>Unique tracks</span>
                </MiniStatStyledWrapper>
                <MiniStatStyledWrapper>
                  <strong>{stats.summary.topGenre || "—"}</strong>
                  <span>Top genre</span>
                </MiniStatStyledWrapper>
                <MiniStatStyledWrapper>
                  <strong>{stats.summary.adImpressions}</strong>
                  <span>Ads heard</span>
                </MiniStatStyledWrapper>
              </MiniStatsGridStyledWrapper>
            ) : (
              <EmptyStateStyledWrapper style={{ paddingTop: 0 }}>
                <FaChartBar />
                <p>
                  {stats
                    ? "Play some tracks — your listening insights will appear here."
                    : "Loading..."}
                </p>
              </EmptyStateStyledWrapper>
            )}

            <DetailsButtonStyled onClick={() => navigate("/account/stats")}>
              View detailed statistics <FaArrowRight size={12} />
            </DetailsButtonStyled>
          </CardStyledWrapper>
        </GridStyledWrapper>

        <CardStyledWrapper>
          <CardHeaderStyledWrapper>
            <Title style={{ fontSize: 18, margin: 0 }}>Your library</Title>
          </CardHeaderStyledWrapper>
          <CardSubtitleStyled>
            Liked songs and every playlist you've made.
          </CardSubtitleStyled>

          <PlaylistGridStyled>
            <PlaylistCardStyled onClick={() => navigate("/liked")}>
              <LikedCoverStyled>
                <FaHeart />
              </LikedCoverStyled>
              <strong>Liked songs</strong>
              <span>
                {likedCount} {likedCount === 1 ? "song" : "songs"}
              </span>
            </PlaylistCardStyled>

            {playlists.map((playlist: any) => {
              const cover = playlist.tracks?.[0]?.trackCover;
              const trackCount = playlist.tracks?.length || 0;

              return (
                <PlaylistCardStyled
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  {cover ? (
                    <img src={cover} alt={playlist.name} />
                  ) : (
                    <LikedCoverStyled style={{ background: "#2f2f2f" }}>
                      <FaMusic />
                    </LikedCoverStyled>
                  )}
                  <strong>{playlist.name}</strong>
                  <span>
                    {trackCount} {trackCount === 1 ? "track" : "tracks"}
                    {playlist.genres?.length > 0 &&
                      ` · ${playlist.genres.slice(0, 2).join(", ")}`}
                  </span>
                </PlaylistCardStyled>
              );
            })}
          </PlaylistGridStyled>
        </CardStyledWrapper>

        <GridStyledWrapper>
          <CardStyledWrapper style={{ marginBottom: 0 }}>
            <CardHeaderStyledWrapper>
              <Title style={{ fontSize: 18, margin: 0 }}>Recently played</Title>
            </CardHeaderStyledWrapper>
            <CardSubtitleStyled>Pick up where you left off.</CardSubtitleStyled>

            {recentlyPlayed.length ? (
              <TrackListStyled>
                {recentlyPlayed.map((track, index) => (
                  <TrackListRowStyled
                    key={track.id || track._id}
                    onClick={() => setQueue(recentlyPlayed, index)}
                  >
                    <img src={track.trackCover} alt="" />
                    <div>
                      <strong>{track.trackName}</strong>
                      <span>{artistNames(track)}</span>
                    </div>
                    <FaPlay size={11} color={colors.gray} />
                  </TrackListRowStyled>
                ))}
              </TrackListStyled>
            ) : (
              <EmptyStateStyledWrapper style={{ paddingTop: 0 }}>
                <FaSeedling />
                <p>Nothing here yet — start playing something.</p>
              </EmptyStateStyledWrapper>
            )}
          </CardStyledWrapper>

          <CardStyledWrapper style={{ marginBottom: 0 }}>
            <CardHeaderStyledWrapper>
              <Title style={{ fontSize: 18, margin: 0 }}>Your top tracks</Title>
            </CardHeaderStyledWrapper>
            <CardSubtitleStyled>The songs you come back to most.</CardSubtitleStyled>

            {topTracksQueue.length ? (
              <TrackListStyled>
                {topTracksQueue.map((track, index) => (
                  <TrackListRowStyled
                    key={track.id}
                    onClick={() => setQueue(topTracksQueue as any, index)}
                  >
                    <RankStyled>{index + 1}</RankStyled>
                    <img src={track.trackCover} alt="" />
                    <div>
                      <strong>{track.trackName}</strong>
                      <span>{artistNames(track)}</span>
                    </div>
                    <PlayCountStyled>
                      {track.plays} {track.plays === 1 ? "play" : "plays"}
                    </PlayCountStyled>
                  </TrackListRowStyled>
                ))}
              </TrackListStyled>
            ) : (
              <EmptyStateStyledWrapper style={{ paddingTop: 0 }}>
                <FaMusic />
                <p>Your most played tracks will show up here.</p>
              </EmptyStateStyledWrapper>
            )}
          </CardStyledWrapper>
        </GridStyledWrapper>

        <CardStyledWrapper>
          <CardHeaderStyledWrapper>
            <Title style={{ fontSize: 18, margin: 0 }}>Achievements</Title>
            <span style={{ fontSize: 13, color: colors.gray }}>
              {unlockedCount} / {achievements.length} unlocked
            </span>
          </CardHeaderStyledWrapper>

          <AchievementsGridStyled>
            {achievements.map((achievement) => {
              const isUnlocked = achievement.current >= achievement.target;
              const progress = Math.min(achievement.current / achievement.target, 1);

              return (
                <AchievementStyled key={achievement.title} $isUnlocked={isUnlocked}>
                  <div>
                    <i>{achievement.icon}</i>
                    <strong>{achievement.title}</strong>
                  </div>
                  <p>{achievement.description}</p>
                  <AchievementProgressStyled>
                    <div>
                      <div style={{ width: `${progress * 100}%` }} />
                    </div>
                    {isUnlocked
                      ? "Unlocked"
                      : `${Math.min(achievement.current, achievement.target)} / ${achievement.target}`}
                  </AchievementProgressStyled>
                </AchievementStyled>
              );
            })}
          </AchievementsGridStyled>
        </CardStyledWrapper>

        <DangerZoneStyledWrapper>
          <div>
            <p style={{ fontWeight: 700 }}>Log out</p>
            <p style={{ color: colors.gray, fontSize: 13 }}>
              You'll need to sign in again to access your account.
            </p>
          </div>

          <Button variant="secondary" style={{ margin: 0, width: 140 }} onClick={logout}>
            Log out
          </Button>
        </DangerZoneStyledWrapper>

        {isEditingGenres && <GenresModal onClose={() => setIsEditingGenres(false)} />}

        {isEditingName && (
          <Modal onClose={() => setIsEditingName(false)} width={360} height={260}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <Title style={{ fontSize: 18 }}>Edit profile</Title>

              <Input
                type="text"
                placeholder="Name"
                value={nameDraft}
                onChange={(e: any) => setNameDraft(e.target.value)}
                style={{ width: "100%", margin: "14px 0 8px" }}
                autoFocus
              />

              <Input
                type="text"
                placeholder="Surname"
                value={surnameDraft}
                onChange={(e: any) => setSurnameDraft(e.target.value)}
                style={{ width: "100%", margin: "0 0 14px" }}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="secondary"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setIsEditingName(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ flex: 1, margin: 0 }}
                  onClick={handleSaveName}
                  disabled={isSavingName || !nameDraft.trim()}
                >
                  {isSavingName ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </UserPageContentStyled>
    </UserPageStyledWrapper>
  );
});
