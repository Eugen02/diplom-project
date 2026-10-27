import React, { ReactElement } from "react";
import styled from "styled-components";
import { FaInfoCircle } from "react-icons/fa";
import { chartTheme } from "../../shared-components/Charts/chartTheme";
import { primaryAlpha } from "../../../constants/colors";
import { RecommendationExplanationInterface } from "../../../types/interfaces/RecommendationExplanation.interface";

const AUDIO_FEATURE_LABELS: Record<string, string> = {
  danceability: "Danceability",
  energy: "Energy",
  key: "Musical key",
  loudness: "Loudness",
  mode: "Major / minor mode",
  speechiness: "Speechiness",
  acousticness: "Acousticness",
  instrumentalness: "Instrumentalness",
  liveness: "Liveness",
  valence: "Mood (valence)",
  tempo: "Tempo",
  duration_ms: "Track length",
  popularity: "Popularity",
};

const BadgeStyled = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid
    ${({ $isOpen }) => ($isOpen ? primaryAlpha(0.8) : primaryAlpha(0.4))};
  background: ${({ $isOpen }) => primaryAlpha($isOpen ? 0.25 : 0.12)};
  color: ${chartTheme.inkPrimary};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: ${primaryAlpha(0.25)};
  }

  svg {
    color: ${chartTheme.inkSecondary};
  }
`;

const PanelStyled = styled.div`
  margin: -8px 0 20px 88px;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: ${chartTheme.fontFamily};
  color: ${chartTheme.inkSecondary};
  font-size: 13px;
`;

const PanelTitleStyled = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${chartTheme.inkPrimary};
`;

const SplitBarStyled = styled.div`
  display: flex;
  gap: 2px;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
`;

const SegmentStyled = styled.div`
  height: 100%;
`;

const LegendStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 8px 0 14px;
  font-size: 12px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  b {
    color: ${chartTheme.inkPrimary};
    font-variant-numeric: tabular-nums;
  }
`;

const ReasonRowStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;

  > span:first-child {
    min-width: 110px;
    color: ${chartTheme.inkMuted};
  }
`;

const ChipStyled = styled.span`
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: ${chartTheme.inkPrimary};
  font-size: 12px;
`;

const FormulaStyled = styled.p`
  margin: 10px 0 0;
  padding-top: 10px;
  border-top: 1px solid ${chartTheme.grid};
  font-size: 12px;
  color: ${chartTheme.inkMuted};

  code {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    color: ${chartTheme.inkSecondary};
  }
`;

const toPercent = (value: number) => `${Math.round(value * 100)}%`;

interface MatchBadgeProps {
  explanation: RecommendationExplanationInterface;
  isOpen: boolean;
  onToggle: () => void;
}

export const MatchBadge = (props: MatchBadgeProps): ReactElement | null => {
  const { explanation, isOpen, onToggle } = props;

  if (explanation.score === null) {
    return null;
  }

  return (
    <BadgeStyled
      $isOpen={isOpen}
      aria-expanded={isOpen}
      title="Why this track?"
      onClick={onToggle}
    >
      {toPercent(explanation.score)} match
      <FaInfoCircle size={11} />
    </BadgeStyled>
  );
};

interface WhyPanelProps {
  explanation: RecommendationExplanationInterface;
}

export const WhyPanel = (props: WhyPanelProps): ReactElement | null => {
  const { explanation } = props;
  const { score, textScore, audioScore, topTerms, topAudioFeatures } = explanation;

  if (score === null || textScore === null || audioScore === null) {
    return null;
  }

  return (
    <PanelStyled>
      <PanelTitleStyled>Why this track?</PanelTitleStyled>

      <SplitBarStyled
        role="img"
        aria-label={`Similarity ${toPercent(score)}: text ${toPercent(
          textScore
        )}, sound ${toPercent(audioScore)}`}
      >
        <SegmentStyled
          style={{ width: `${textScore * 100}%`, background: chartTheme.series1 }}
        />
        <SegmentStyled
          style={{ width: `${audioScore * 100}%`, background: chartTheme.series2 }}
        />
      </SplitBarStyled>

      <LegendStyled>
        <span>
          <i style={{ background: chartTheme.series1 }} />
          Name, artist & genre <b>{toPercent(textScore)}</b>
        </span>
        <span>
          <i style={{ background: chartTheme.series2 }} />
          Sound <b>{toPercent(audioScore)}</b>
        </span>
        <span>
          Total similarity <b>{toPercent(score)}</b>
        </span>
      </LegendStyled>

      {topTerms.length > 0 && (
        <ReasonRowStyled>
          <span>Shared keywords</span>
          {topTerms.map((term) => (
            <ChipStyled key={term.feature}>“{term.feature}”</ChipStyled>
          ))}
        </ReasonRowStyled>
      )}

      {topAudioFeatures.length > 0 && (
        <ReasonRowStyled>
          <span>Similar sound</span>
          {topAudioFeatures.map((feature) => (
            <ChipStyled key={feature.feature}>
              {AUDIO_FEATURE_LABELS[feature.feature] || feature.feature}
            </ChipStyled>
          ))}
        </ReasonRowStyled>
      )}

      <FormulaStyled>
        <code>
          cos(u, v) = Σ cⱼ = {textScore.toFixed(2)} + {audioScore.toFixed(2)} ={" "}
          {score.toFixed(2)}
        </code>
        , де <code>cⱼ = uⱼ·vⱼ / (‖u‖·‖v‖)</code> — внесок ознаки j, u — профіль
        плейлиста (центроїд його треків), v — цей трек. Перший доданок — сума
        внесків TF-IDF-термів, другий — аудіоознак.
      </FormulaStyled>
    </PanelStyled>
  );
};
