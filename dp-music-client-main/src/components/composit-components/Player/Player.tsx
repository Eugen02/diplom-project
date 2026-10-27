import React, { ReactElement } from "react";
import {
  FaBackward,
  FaForward,
  FaHeart,
  FaPause,
  FaPlay,
  FaVolumeDown,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

import {
  PlayerActionsStyledWrapper,
  PlayerControlsStyledWrapper,
  PlayerStyledWrapper,
  TrackInfoStyledWrapper,
  TractNameStyledWrapper,
  ProgressLineStyledWrapper,
  VolumeControlStyledWrapper,
  VolumeSliderStyledWrapper,
} from "./Player.styled";
import { colors } from "../../../constants/colors";
import { TrackCover } from "../../shared-components/TrackCover/TrackCover";
import { Artists } from "../../shared-components/Artists/Artists";
import { observer } from "mobx-react-lite";
import { usePlayerStore } from "../../../hooks/usePlayerStore";
import { userApi } from "../../../api/user.api";
import { useUserStore } from "../../../hooks/useUserStore";
import { trackApi } from "../../../api/requests/track.api";
import { AddToPlaylistButton } from "../../shared-components/AddToPlaylistButton/AddToPlaylistButton";
import { AdBanner } from "./AdBanner";

export const LikeButton = observer(({ trackId }: { trackId: string }) => {
  const { setCurrentUser, user } = useUserStore();
  const { likedTracks = [] } = user || {};
  const isTrackLiked = likedTracks.map(({ id }: any) => id).includes(trackId);

  const getUser = async () => {
    const user = await userApi.getUser();
    setCurrentUser(user);
  };
  const handleLike = async () => {
    await trackApi.likeTrack(trackId);
    await getUser();
  };
  const handleUnlike = async () => {
    await trackApi.unlikeTrack(trackId);
    await getUser();
  };

  return (
    <div
      style={{
        cursor: "pointer",
      }}
      onClick={isTrackLiked ? handleUnlike : handleLike}
    >
      <FaHeart
        style={{
          color: isTrackLiked ? colors.primary : colors.white,
        }}
      />
    </div>
  );
});

const VOLUME_STORAGE_KEY = "player_volume";

const getInitialVolume = (): number => {
  try {
    const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = stored ? parseFloat(stored) : 1;

    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
  } catch {
    return 1;
  }
};

const converMsToMinutes = (ms: number) => {
  const minutes = Math.floor(ms / 1000 / 60);
  const seconds = Math.floor((ms / 1000) % 60);

  return `${minutes < 10 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
};

export const Player = observer((): ReactElement => {
  const {
    track,
    queue,
    durationMs,
    isPlaying,
    togglePlaying,
    setIsPlaying,
    setDurationMs,
    playNext,
    playPrevious,
  } = usePlayerStore();
  // @ts-ignore
  const trackId = track?.id || track?._id || "";

  const { trackName, trackCover, artists } = track || {};

  const isShowPlayer = Boolean(trackName);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  // Start playback as soon as the freshly fetched preview can play.
  const shouldAutoplayRef = React.useRef(false);
  const hasRetriedPreviewRef = React.useRef(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [counterId, setCounterId] = React.useState<any>(null);
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [ad, setAd] = React.useState<any>(null);
  const [volume, setVolume] = React.useState(getInitialVolume);
  const [isMuted, setIsMuted] = React.useState(false);

  // The <audio> element is remounted on every track change (key={trackId})
  // and only appears once its preview URL resolves, so re-apply the current
  // volume/mute state whenever it (re)appears.
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [trackId, previewUrl, volume, isMuted]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);
    setIsMuted(false);

    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(newVolume));
    } catch {}
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const startCounter = () => {
    const id = setInterval(() => {
      setCurrentTimeMs((prev) => prev + 1000);
    }, 1000);

    setCounterId(id);
  };

  const stopCounter = () => {
    clearInterval(counterId);
  };

  // Whenever a new track is selected (fresh pick, or via next/previous):
  // reset local playback state, fetch a fresh preview URL and log the play
  // (feeds Recently Played + the ad simulation) in parallel, then either
  // start playback or - if an ad was served for this play - keep the track
  // silent until the ad is dismissed.
  React.useEffect(() => {
    let isCancelled = false;

    stopCounter();
    setCurrentTimeMs(0);
    setAd(null);
    setPreviewUrl(null);
    setDurationMs(0);
    shouldAutoplayRef.current = false;
    hasRetriedPreviewRef.current = false;

    if (!trackId) {
      return;
    }

    Promise.all([
      trackApi.getPreview(trackId).catch(() => null),
      trackApi.logPlay(trackId),
    ]).then(([freshPreviewUrl, { ad }]) => {
      if (isCancelled) {
        return;
      }

      setPreviewUrl(freshPreviewUrl);

      if (!freshPreviewUrl) {
        // No preview available: simulate progress over the catalog duration.
        setDurationMs(track?.durationMs || 0);
      }

      if (ad) {
        setAd(ad);
        setIsPlaying(false);

        return;
      }

      if (!isPlaying) {
        return;
      }

      if (freshPreviewUrl) {
        shouldAutoplayRef.current = true;
      } else {
        startCounter();
      }
    });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  const handleCanPlay = () => {
    if (shouldAutoplayRef.current) {
      shouldAutoplayRef.current = false;
      audioRef.current?.play().catch(() => {});
    }
  };

  // A preview URL can expire while the track sits paused; fetch a new one once.
  const handleAudioError = () => {
    if (hasRetriedPreviewRef.current || !trackId) {
      return;
    }

    hasRetriedPreviewRef.current = true;

    trackApi
      .getPreview(trackId)
      .then((freshPreviewUrl) => {
        if (freshPreviewUrl && freshPreviewUrl !== previewUrl) {
          shouldAutoplayRef.current = isPlaying;
          setPreviewUrl(freshPreviewUrl);
        }
      })
      .catch(() => {});
  };

  const resumeAfterAd = () => {
    setAd(null);
    setIsPlaying(true);

    if (previewUrl) {
      audioRef.current?.play().catch(() => {});
    } else {
      startCounter();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTimeMs(audioRef.current.currentTime * 1000);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      setDurationMs(audioRef.current.duration * 1000);
    }
  };

  const handleEnded = () => {
    setCurrentTimeMs(0);

    if (queue && queue.length > 1) {
      playNext();

      return;
    }

    if (isPlaying) {
      togglePlaying();
    }
  };

  const handleTogglePlaying = () => {
    if (ad) {
      resumeAfterAd();

      return;
    }

    if (previewUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    } else if (isPlaying) {
      stopCounter();
    } else {
      startCounter();
    }

    togglePlaying();
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!durationMs) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1
    );
    const newTimeMs = ratio * durationMs;

    setCurrentTimeMs(newTimeMs);

    if (audioRef.current) {
      audioRef.current.currentTime = newTimeMs / 1000;
    }
  };

  return (
    <>
      {ad && (
        <AdBanner
          campaignId={ad.campaignId}
          brand={ad.brand}
          tagline={ad.tagline}
          description={ad.description}
          url={ad.url}
          genre={ad.genre}
          onClose={resumeAfterAd}
        />
      )}

      <PlayerStyledWrapper $isShowPlayer={isShowPlayer}>
      {previewUrl && (
        <audio
          key={trackId}
          ref={audioRef}
          src={previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleAudioError}
          onEnded={handleEnded}
          style={{ display: "none" }}
        />
      )}
      <TrackInfoStyledWrapper>
        <TrackCover coverUrl={trackCover || ""} size={55} margin="0 22px 0 0" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TractNameStyledWrapper>{trackName}</TractNameStyledWrapper>

          <Artists artists={artists || []} />
        </div>
      </TrackInfoStyledWrapper>
      <PlayerControlsStyledWrapper>
        <div
          style={{
            marginBottom: 10,
          }}
        >
          <FaBackward
            color={colors.white}
            style={{ cursor: "pointer" }}
            onClick={playPrevious}
          />

          {isPlaying ? (
            <FaPause
              color={colors.white}
              style={{ margin: "0 30px", cursor: "pointer" }}
              onClick={handleTogglePlaying}
            />
          ) : (
            <FaPlay
              color={colors.white}
              style={{ margin: "0 30px", cursor: "pointer" }}
              onClick={handleTogglePlaying}
            />
          )}

          <FaForward
            color={colors.white}
            style={{ cursor: "pointer" }}
            onClick={playNext}
          />
        </div>
        <ProgressLineStyledWrapper
          passedPercent={
            durationMs ? Math.min((currentTimeMs / durationMs) * 100, 100) : 0
          }
          onClick={handleSeek}
        />

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
          }}
        >
          <p>
            {converMsToMinutes(currentTimeMs)} / {converMsToMinutes(durationMs)}
          </p>
        </div>
      </PlayerControlsStyledWrapper>
      <PlayerActionsStyledWrapper>
        <LikeButton trackId={trackId} />
        {/* @ts-ignore */}
        <AddToPlaylistButton trackId={track?.id || track?._id || ""} />

        <VolumeControlStyledWrapper>
          <div
            style={{ cursor: "pointer", display: "flex" }}
            onClick={handleToggleMute}
          >
            {isMuted || volume === 0 ? (
              <FaVolumeMute color={colors.white} />
            ) : volume < 0.5 ? (
              <FaVolumeDown color={colors.white} />
            ) : (
              <FaVolumeUp color={colors.white} />
            )}
          </div>

          <VolumeSliderStyledWrapper
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            $percent={(isMuted ? 0 : volume) * 100}
          />
        </VolumeControlStyledWrapper>
      </PlayerActionsStyledWrapper>
      </PlayerStyledWrapper>
    </>
  );
});
