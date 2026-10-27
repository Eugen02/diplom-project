import styled from "styled-components";
import { colors, primaryAlpha } from "../../constants/colors";

export const UserPageStyledWrapper = styled.div`
  width: 100%;
  height: 95vh;
  overflow-y: auto;
`;

export const UserPageContentStyled = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  padding: 50px 60px 140px;
`;

export const HeroCardStyledWrapper = styled.div`
  position: relative;
  border-radius: 20px;
  padding: 40px 36px;
  margin-bottom: 24px;
  overflow: hidden;
  background: ${colors.brandGradient};
  box-shadow: 0 20px 40px -20px ${primaryAlpha(0.35)};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 15% 20%,
      rgba(255, 255, 255, 0.18),
      transparent 45%
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
    pointer-events: none;
  }
`;

export const GridStyledWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

export const CardStyledWrapper = styled.div`
  background: linear-gradient(160deg, ${colors.darkGray} 0%, #18181F 100%);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
`;

export const CardHeaderStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

export const ProfileRowStyledWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
`;

export const AvatarStyledWrapper = styled.div<{ $hasImage?: boolean }>`
  position: relative;
  width: 100px;
  height: 100px;
  min-width: 100px;
  border-radius: 50%;
  background: ${({ $hasImage }) =>
    $hasImage ? "transparent" : "rgba(255, 255, 255, 0.18)"};
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 800;
  text-transform: uppercase;
  border: 3px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const AvatarUploadButtonStyled = styled.label`
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.black};
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: ${colors.primary};
  }

  input {
    display: none;
  }
`;

export const EditIconButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: ${colors.white};
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const ChipStyledWrapper = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    ${primaryAlpha(0.25)},
    rgba(79, 70, 229, 0.2)
  );
  border: 1px solid ${primaryAlpha(0.3)};
  text-transform: capitalize;
  font-size: 14px;
`;

export const ChipsRowStyledWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const EmptyStateStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: ${colors.gray};
  text-align: center;

  svg {
    font-size: 26px;
    margin-bottom: 10px;
    opacity: 0.6;
  }
`;

export const MiniStatsGridStyledWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
`;

export const MiniStatStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 0;

  strong {
    font-size: 22px;
    font-weight: 700;
    color: ${colors.white};
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 12px;
    color: ${colors.gray};
  }
`;

export const DetailsButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid ${primaryAlpha(0.45)};
  background: ${primaryAlpha(0.12)};
  color: ${colors.white};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: ${primaryAlpha(0.25)};
  }
`;

export const HeroStatsRowStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(4px);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
  }

  b {
    color: ${colors.white};
  }
`;

export const CardSubtitleStyled = styled.p`
  margin: -10px 0 16px;
  font-size: 13px;
  color: ${colors.gray};
`;

export const SubheadingStyled = styled.p`
  margin: 18px 0 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.gray};
`;

export const GenreBarRowStyled = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr 44px;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: 13px;

  > span:first-child {
    text-transform: capitalize;
    color: ${colors.lightGray};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > span:last-child {
    text-align: right;
    font-weight: 700;
    color: ${colors.white};
  }
`;

export const GenreBarTrackStyled = styled.div`
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;

  div {
    height: 100%;
    min-width: 2px;
    border-radius: 3px;
    background: ${colors.primary};
  }
`;

export const SuggestChipStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px dashed ${primaryAlpha(0.6)};
  background: transparent;
  color: ${colors.lightGray};
  font-size: 13px;
  text-transform: capitalize;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover:not(:disabled) {
    background: ${primaryAlpha(0.15)};
    color: ${colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const PersonalityStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    ${primaryAlpha(0.22)},
    rgba(79, 70, 229, 0.22)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);

  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    font-size: 18px;
    color: ${colors.white};
  }

  strong {
    display: block;
    font-size: 16px;
    color: ${colors.white};
  }

  span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
  }
`;

export const PlaylistGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
`;

export const PlaylistCardStyled = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: ${colors.white};
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  min-width: 0;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.08);
  }

  img,
  > div:first-child {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 10px;
    object-fit: cover;
  }

  strong {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 12px;
    color: ${colors.gray};
  }
`;

export const LikedCoverStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.brandGradient};
  font-size: 38px;
  color: ${colors.white};
`;

export const TrackListStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TrackListRowStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${colors.white};
  text-align: left;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  img {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 6px;
    object-fit: cover;
  }

  > div {
    flex: 1;
    min-width: 0;
  }

  strong,
  > div > span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-size: 14px;
  }

  > div > span {
    font-size: 12px;
    color: ${colors.gray};
  }
`;

export const RankStyled = styled.span`
  width: 18px;
  flex-shrink: 0;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: ${colors.gray};
`;

export const PlayCountStyled = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  color: ${colors.gray};
`;

export const AchievementsGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
`;

export const AchievementStyled = styled.div<{ $isUnlocked: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid
    ${({ $isUnlocked }) =>
      $isUnlocked ? primaryAlpha(0.45) : "rgba(255, 255, 255, 0.06)"};
  background: ${({ $isUnlocked }) =>
    $isUnlocked
      ? `linear-gradient(135deg, ${primaryAlpha(0.18)}, rgba(79, 70, 229, 0.1))`
      : "rgba(255, 255, 255, 0.03)"};

  > div:first-child {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    font-size: 15px;
    background: ${({ $isUnlocked }) =>
      $isUnlocked ? colors.primary : "rgba(255, 255, 255, 0.08)"};
    color: ${({ $isUnlocked }) => ($isUnlocked ? colors.white : colors.gray)};
  }

  strong {
    font-size: 14px;
    color: ${({ $isUnlocked }) => ($isUnlocked ? colors.white : colors.lightGray)};
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: ${colors.gray};
  }
`;

export const AchievementProgressStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: ${colors.gray};

  > div {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  > div > div {
    height: 100%;
    border-radius: 2px;
    background: ${colors.primary};
  }
`;

export const DangerZoneStyledWrapper = styled(CardStyledWrapper)`
  border: 1px solid rgba(255, 90, 90, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
`;
