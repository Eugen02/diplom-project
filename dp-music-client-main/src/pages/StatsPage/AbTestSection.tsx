import React, { ReactElement } from "react";
import {
  FaBalanceScale,
  FaCheckCircle,
  FaFlask,
  FaHourglassHalf,
  FaPercentage,
  FaTimesCircle,
  FaUserTag,
  FaUsers,
} from "react-icons/fa";
import { AbTestInterface } from "../../types/interfaces/Stats.interface";
import {
  CHART_LOCALE,
  chartTheme,
  formatCompact,
  formatMoney,
  formatNumber,
  formatPercent,
} from "../../components/shared-components/Charts/chartTheme";
import { ChartCard } from "../../components/shared-components/Charts/ChartCard";
import { IntervalChart } from "../../components/shared-components/Charts/IntervalChart";
import { DataTable } from "../../components/shared-components/Charts/DataTable";
import { StatTile } from "../../components/shared-components/Charts/StatTile";
import { StatsSection, StatsSectionMeta } from "./StatsSection";
import {
  ChartsGridStyled,
  InsightStyled,
  MetaRowStyled,
  ProgressTrackStyled,
  TilesGridStyled,
} from "./StatsPage.styled";

const GROUP_LABELS = {
  targeted: "A · За жанром",
  random: "B · Випадкова (контроль)",
};

const GROUP_COLORS = {
  targeted: chartTheme.series1,
  random: chartTheme.series2,
};

const asPercent = (ratio: number) => formatPercent(Math.round(ratio * 1000) / 10);

const formatPValue = (pValue: number) =>
  pValue < 0.001 ? "< 0,001" : formatNumber(pValue, 3);

interface AbTestSectionProps {
  section: StatsSectionMeta;
  index: number;
  abTest: AbTestInterface;
}

export const AbTestSection = (props: AbTestSectionProps): ReactElement => {
  const { section, index, abTest } = props;
  const { groups, verdict, pValue, zScore, lift, requiredPerGroup } = abTest;
  const [targeted, random] = groups;

  const smallestGroup = Math.min(targeted.impressions, random.impressions);
  const progress = Math.min(smallestGroup / requiredPerGroup, 1);

  const insight = () => {
    if (verdict === "insufficient_data") {
      return (
        <>
          <b>Поки замало даних.</b> Щоб виявити різницю CTR у{" "}
          {asPercent(abTest.minimumDetectableLift)}, кожній групі потрібно
          близько <b>{formatCompact(requiredPerGroup)}</b> показів (зараз{" "}
          {targeted.impressions} і {random.impressions}). Результат
          оновлюватиметься в міру надходження даних.
        </>
      );
    }

    if (verdict === "significant" && lift !== null) {
      return (
        <>
          Реклама за жанром має на <b>{asPercent(Math.abs(lift))}</b>{" "}
          {lift >= 0 ? "вищий" : "нижчий"} CTR, ніж випадкова, —{" "}
          <b>різниця статистично значуща</b> (p = {formatPValue(pValue!)}).
        </>
      );
    }

    return (
      <>
        <b>Значущої різниці немає</b> між рекламою за жанром і випадковою (p ={" "}
        {formatPValue(pValue!)} ≥ {formatNumber(abTest.alpha, 2)}). На поточних
        даних таргетинг помітно не впливає на CTR.
      </>
    );
  };

  const verdictTile = {
    insufficient_data: { label: "Замало даних", icon: <FaHourglassHalf /> },
    significant: { label: "Значуща", icon: <FaCheckCircle /> },
    not_significant: { label: "Незначуща", icon: <FaTimesCircle /> },
  }[verdict];

  return (
    <StatsSection
      section={section}
      index={index}
      icon={<FaFlask />}
      title="Чи працює таргетована реклама краще?"
      subtitle="Живий A/B-тест: половина користувачів чує рекламу під жанр, який слухає, інша половина — випадкову."
    >
      <InsightStyled $accent={section.accent}>
        <FaFlask />
        <span>{insight()}</span>
      </InsightStyled>

      <MetaRowStyled>
        <span>
          Ви в групі <b>{GROUP_LABELS[abTest.yourGroup]}</b>
        </span>
        {abTest.since && (
          <span>
            триває з{" "}
            <b>
              {new Date(abTest.since).toLocaleDateString(CHART_LOCALE, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </b>
          </span>
        )}
        <span>
          α = <b>{formatNumber(abTest.alpha, 2)}</b> · потужність{" "}
          <b>{asPercent(abTest.power)}</b>
        </span>
      </MetaRowStyled>

      <TilesGridStyled>
        <StatTile
          label="Висновок"
          icon={verdictTile.icon}
          value={verdictTile.label}
          formula="p-value < α → відхиляємо H₀"
        />
        <StatTile
          label="p-value"
          icon={<FaPercentage />}
          value={pValue === null ? "—" : formatPValue(pValue)}
          hint={
            zScore === null
              ? "Потрібні покази в обох групах"
              : `z = ${formatNumber(zScore, 2)}`
          }
          formula="2 · (1 − Φ(|z|))"
        />
        <StatTile
          label="Приріст CTR (A проти B)"
          icon={<FaBalanceScale />}
          value={lift === null ? "—" : `${lift >= 0 ? "+" : ""}${asPercent(lift)}`}
          formula="(CTR_A − CTR_B) / CTR_B"
        />
        <StatTile
          label="Набрано вибірки"
          icon={<FaUsers />}
          value={asPercent(progress)}
          hint={
            <>
              {formatCompact(smallestGroup)} / {formatCompact(requiredPerGroup)}{" "}
              на групу
              <ProgressTrackStyled>
                <div style={{ width: `${progress * 100}%` }} />
              </ProgressTrackStyled>
            </>
          }
          formula="n = (z_α/2 + z_β)² · Σp(1−p) / Δ²"
        />
      </TilesGridStyled>

      <ChartsGridStyled>
        <ChartCard
          title="CTR з 95% довірчими інтервалами"
          subtitle="Якщо інтервали сильно перекриваються, різниця може бути випадковою"
          legend={[
            { label: GROUP_LABELS.targeted, color: GROUP_COLORS.targeted },
            { label: GROUP_LABELS.random, color: GROUP_COLORS.random },
          ]}
          chart={
            <IntervalChart
              valueLabel="CTR"
              rows={groups.map((group) => ({
                label: GROUP_LABELS[group.variant],
                value: group.ctr,
                low: group.ciLow,
                high: group.ciHigh,
                color: GROUP_COLORS[group.variant],
                detail: `${group.clicks} кліків / ${group.impressions} показів`,
              }))}
            />
          }
          table={
            <DataTable
              rowKey={(row) => row.variant}
              rows={groups}
              columns={[
                { header: "Група", render: (row) => GROUP_LABELS[row.variant] },
                { header: "CTR", render: (row) => asPercent(row.ctr), numeric: true },
                {
                  header: "95% ДІ",
                  render: (row) => `${asPercent(row.ciLow)} – ${asPercent(row.ciHigh)}`,
                  numeric: true,
                },
              ]}
            />
          }
          formula={
            <>
              Інтервал Вілсона:{" "}
              <code>(p + z²/2n ± z·√(p(1−p)/n + z²/4n²)) / (1 + z²/n)</code>,{" "}
              <code>z = 1.96</code> — діапазон, де з імовірністю 95% лежить
              справжній CTR групи
            </>
          }
        />

        <ChartCard
          title="Групи поруч"
          subtitle="Сирі дані, на яких тримається тест"
          chart={
            <DataTable
              rowKey={(row) => row.variant}
              rows={groups}
              columns={[
                { header: "Група", render: (row) => GROUP_LABELS[row.variant] },
                { header: "Користувачі", render: (row) => row.users, numeric: true },
                {
                  header: "Покази",
                  render: (row) => formatCompact(row.impressions),
                  numeric: true,
                },
                { header: "Кліки", render: (row) => row.clicks, numeric: true },
                {
                  header: "Дохід",
                  render: (row) => formatMoney(row.revenue),
                  numeric: true,
                },
              ]}
            />
          }
          formula={
            <>
              Z-тест для двох пропорцій:{" "}
              <code>z = (p_A − p_B) / √(p̂(1 − p̂)(1/I_A + 1/I_B))</code>, де{" "}
              <code>p̂ = (C_A + C_B) / (I_A + I_B)</code> — спільний CTR; H₀: CTR
              груп однаковий
            </>
          }
        />
      </ChartsGridStyled>

      <MetaRowStyled style={{ marginBottom: 0 }}>
        <span>
          <FaUserTag style={{ marginRight: 6, verticalAlign: -1 }} />
          Групу визначає хеш id користувача, тож ви завжди залишаєтеся в тій
          самій групі
        </span>
      </MetaRowStyled>
    </StatsSection>
  );
};
