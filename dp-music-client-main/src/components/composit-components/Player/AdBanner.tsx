import React, { ReactElement, useEffect, useState } from "react";
import { FaBullhorn, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import { colors } from "../../../constants/colors";
import { adsApi } from "../../../api/ads.api";

type AdBannerProps = {
  campaignId: string;
  brand: string;
  tagline: string;
  description: string;
  url: string;
  genre: string;
  onClose: () => void;
};

const AUTO_DISMISS_SECONDS = 6;

export const AdBanner = ({
  campaignId,
  brand,
  tagline,
  description,
  url,
  genre,
  onClose,
}: AdBannerProps): ReactElement => {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onClose();

      return;
    }

    const timeout = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const handleLearnMore = () => {
    adsApi.logClick(campaignId, genre);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: colors.deepBlack,
        border: `2px solid ${colors.primary}`,
        boxShadow: `0 0 0 4px rgba(139, 92, 246, 0.18), 0 10px 30px rgba(0,0,0,0.5)`,
        borderRadius: 12,
        padding: "18px 24px",
        width: 440,
        zIndex: 300,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: colors.primary,
            fontSize: 13,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          <FaBullhorn size={16} />
          Ad break &middot; music is paused
        </div>

        <FaTimes
          style={{ cursor: "pointer", color: colors.gray }}
          onClick={onClose}
        />
      </div>

      <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{brand}</p>
      <p style={{ color: colors.lightGray, fontSize: 15, marginBottom: 4 }}>
        {tagline}
      </p>
      <p style={{ color: colors.gray, fontSize: 13, marginBottom: 14 }}>
        {description}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <button
          onClick={handleLearnMore}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: colors.primary,
            color: colors.white,
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Learn more
          <FaExternalLinkAlt size={11} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            color: colors.gray,
            fontSize: 12,
            textTransform: "capitalize",
          }}
        >
          Targeted &middot; {genre}
        </p>

        <p style={{ color: colors.primary, fontSize: 13, fontWeight: 700 }}>
          Music resumes in {secondsLeft}s
        </p>
      </div>
    </div>
  );
};
