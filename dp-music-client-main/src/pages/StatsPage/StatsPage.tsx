import React, { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBalanceScale,
  FaBook,
  FaBullhorn,
  FaChartLine,
  FaCoins,
  FaCompactDisc,
  FaDollarSign,
  FaGlobe,
  FaHeadphones,
  FaLayerGroup,
  FaLightbulb,
  FaListUl,
  FaMousePointer,
  FaPercent,
  FaTags,
} from "react-icons/fa";
import { userApi } from "../../api/user.api";
import {
  AdGenreStatInterface,
  StatsResponseInterface,
} from "../../types/interfaces/Stats.interface";
import {
  CHART_LOCALE,
  chartTheme,
  formatCompact,
  formatMoney,
  formatNumber,
  formatPercent,
} from "../../components/shared-components/Charts/chartTheme";
import {
  cosineSimilarity,
  ecpm,
  normalizedEntropy,
} from "../../components/shared-components/Charts/statsMath";
import { ChartCard } from "../../components/shared-components/Charts/ChartCard";
import { BarList } from "../../components/shared-components/Charts/BarList";
import { ColumnChart } from "../../components/shared-components/Charts/ColumnChart";
import { CompareBars } from "../../components/shared-components/Charts/CompareBars";
import {
  DataTable,
  DataTableColumn,
} from "../../components/shared-components/Charts/DataTable";
import { StatTile } from "../../components/shared-components/Charts/StatTile";
import { StatsSection, StatsSectionMeta } from "./StatsSection";
import { RecommenderQualitySection } from "./RecommenderQualitySection";
import { AbTestSection } from "./AbTestSection";
import { StatsMethodology } from "./StatsMethodology";
import {
  BackLinkStyled,
  ChartsGridStyled,
  InsightStyled,
  NoteStyled,
  PageHeaderStyled,
  SectionNavButtonStyled,
  SectionNavStyled,
  StatsContentStyled,
  StatsPageStyledWrapper,
  StatusMessageStyled,
  TilesGridStyled,
} from "./StatsPage.styled";

const ACTIVITY_DAYS = 14;
const TASTE_COMPARE_LIMIT = 8;

const SECTIONS: Record<string, StatsSectionMeta> = {
  listening: { id: "listening", label: "Прослуховування", accent: "139, 92, 246" },
  recommender: {
    id: "recommender",
    label: "Якість рекомендацій",
    accent: "57, 135, 229",
  },
  ads: { id: "ads", label: "Ваша реклама", accent: "217, 89, 38" },
  abTest: { id: "ab-test", label: "A/B-тест", accent: "25, 158, 112" },
  platform: { id: "platform", label: "Платформа", accent: "201, 133, 0" },
  methodology: { id: "methodology", label: "Методологія", accent: "137, 135, 129" },
};

const SECTION_ORDER = [
  SECTIONS.listening,
  SECTIONS.recommender,
  SECTIONS.ads,
  SECTIONS.abTest,
  SECTIONS.platform,
  SECTIONS.methodology,
];

const sectionIndex = (section: StatsSectionMeta) => SECTION_ORDER.indexOf(section);

const formatDay = (isoDate: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(CHART_LOCALE, {
    timeZone: "UTC",
    ...options,
  });

const toShares = <Row,>(rows: Row[], getValue: (row: Row) => number) => {
  const total = rows.reduce((sum, row) => sum + getValue(row), 0);

  return (row: Row) =>
    total ? Math.round((getValue(row) / total) * 1000) / 10 : 0;
};

const asPercent = (ratio: number) => formatPercent(Math.round(ratio * 1000) / 10);

const describeDiversity = (value: number) => {
  if (value < 0.4) {
    return "зосереджений на кількох жанрах";
  }

  return value < 0.75 ? "досить збалансований" : "дуже різноманітний";
};

const adGenreColumns: DataTableColumn<AdGenreStatInterface>[] = [
  { header: "Жанр", render: (row) => row.genre },
  {
    header: "Покази",
    render: (row) => formatCompact(row.impressions),
    numeric: true,
  },
  { header: "Кліки", render: (row) => formatCompact(row.clicks), numeric: true },
  { header: "CTR", render: (row) => formatPercent(row.ctr), numeric: true },
  { header: "Дохід", render: (row) => formatMoney(row.revenue), numeric: true },
];

export const StatsPage = (): ReactElement => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponseInterface | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    userApi
      .getStats()
      .then(setStats)
      .catch(() => setHasError(true));
  }, []);

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ block: "start" });

  const header = (
    <>
      <BackLinkStyled onClick={() => navigate("/account")}>
        <FaArrowLeft /> Назад до акаунта
      </BackLinkStyled>

      <PageHeaderStyled>
        <h1>Ваша статистика</h1>
        <p>
          Що ви слухаєте, наскільки добре працюють рекомендації та як працює
          модель монетизації через рекламу.
        </p>
      </PageHeaderStyled>
    </>
  );

  if (hasError || !stats) {
    return (
      <StatsPageStyledWrapper>
        <StatsContentStyled>
          {header}
          <StatusMessageStyled>
            {hasError
              ? "Не вдалося завантажити статистику."
              : "Завантажуємо статистику..."}
          </StatusMessageStyled>
        </StatsContentStyled>
      </StatsPageStyledWrapper>
    );
  }

  const { user, platformAds, abTest } = stats;
  const { summary } = user;
  const { model } = platformAds;

  const activityPoints = user.playsByDay.map((day) => ({
    label: formatDay(day.date, { month: "short", day: "numeric" }),
    tooltipLabel: formatDay(day.date, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    value: day.plays,
  }));
  const playsInWindow = user.playsByDay.reduce((sum, day) => sum + day.plays, 0);
  const avgPerDay = playsInWindow / ACTIVITY_DAYS;

  const listenShare = toShares(user.playsByGenre, (row) => row.plays);
  const libraryShare = toShares(user.playlistGenres, (row) => row.tracks);

  const allGenres = Array.from(
    new Set([
      ...user.playsByGenre.map((row) => row.genre),
      ...user.playlistGenres.map((row) => row.genre),
    ])
  );
  const playsVector = allGenres.map(
    (genre) => user.playsByGenre.find((row) => row.genre === genre)?.plays || 0
  );
  const libraryVector = allGenres.map(
    (genre) =>
      user.playlistGenres.find((row) => row.genre === genre)?.tracks || 0
  );

  const diversity = normalizedEntropy(user.playsByGenre.map((row) => row.plays));
  const alignment = cosineSimilarity(playsVector, libraryVector);

  const tasteRows = allGenres
    .map((genre) => {
      const listened = user.playsByGenre.find((row) => row.genre === genre);
      const saved = user.playlistGenres.find((row) => row.genre === genre);

      return {
        label: genre,
        values: [
          listened ? listenShare(listened) : 0,
          saved ? libraryShare(saved) : 0,
        ] as [number, number],
      };
    })
    .sort((a, b) => b.values[0] + b.values[1] - (a.values[0] + a.values[1]))
    .slice(0, TASTE_COMPARE_LIMIT);

  const tasteSeries: [
    { label: string; color: string },
    { label: string; color: string }
  ] = [
    { label: "Частка ваших прослуховувань", color: chartTheme.series1 },
    { label: "Частка треків у ваших плейлистах", color: chartTheme.series2 },
  ];

  const adLoad = summary.totalPlays
    ? summary.adImpressions / summary.totalPlays
    : 0;
  const expectedEcpm = ((model.minRevenue + model.maxRevenue) / 2) * 1000;
  const platformEcpm = ecpm(platformAds.revenue, platformAds.impressions);

  const topListened = user.playsByGenre[0];
  const topBrand = user.adsByBrand[0];
  const topRevenueGenre = [...platformAds.byGenre].sort(
    (a, b) => b.revenue - a.revenue
  )[0];

  return (
    <StatsPageStyledWrapper>
      <StatsContentStyled>
        {header}

        <SectionNavStyled aria-label="Розділи статистики">
          {SECTION_ORDER.map((section) => (
            <SectionNavButtonStyled
              key={section.id}
              $accent={section.accent}
              onClick={() => scrollToSection(section.id)}
            >
              <i />
              {section.label}
            </SectionNavButtonStyled>
          ))}
        </SectionNavStyled>

        <StatsSection
          section={SECTIONS.listening}
          index={sectionIndex(SECTIONS.listening)}
          icon={<FaHeadphones />}
          title="Що ви слухаєте"
          subtitle="На основі кожного треку, який ви запускали в плеєрі."
        >
          <InsightStyled $accent={SECTIONS.listening.accent}>
            <FaLightbulb />
            {topListened ? (
              <span>
                Найбільше ви слухаєте <b>{topListened.genre}</b> (
                {formatPercent(listenShare(topListened))} прослуховувань) — ваш
                смак <b>{describeDiversity(diversity)}</b>. Ваші плейлисти
                збігаються з тим, що ви реально слухаєте, на{" "}
                <b>{asPercent(alignment)}</b>.
              </span>
            ) : (
              <span>
                Послухайте кілька треків — і тут з'явиться аналіз вашого смаку.
              </span>
            )}
          </InsightStyled>

          <TilesGridStyled>
            <StatTile
              label="Усього прослуховувань"
              icon={<FaChartLine />}
              value={formatCompact(summary.totalPlays)}
              hint={`${playsInWindow} за останні ${ACTIVITY_DAYS} днів`}
              formula="N = |події прослуховування|"
            />
            <StatTile
              label="Унікальні треки"
              icon={<FaCompactDisc />}
              value={formatCompact(summary.uniqueTracks)}
              formula="U = |{ унікальні треки }|"
            />
            <StatTile
              label="Улюблений жанр"
              icon={<FaTags />}
              value={summary.topGenre || "—"}
              formula="argmax_g plays(g)"
            />
            <StatTile
              label="Плейлисти"
              icon={<FaListUl />}
              value={formatCompact(summary.playlistsCount)}
              hint={`${summary.playlistTracksCount} треків загалом`}
            />
            <StatTile
              label="Різноманітність жанрів"
              icon={<FaLayerGroup />}
              value={asPercent(diversity)}
              hint="0% — один жанр · 100% — ідеально рівномірно"
              formula="H = −Σ pᵢ·ln pᵢ / ln k"
            />
            <StatTile
              label="Відповідність смаку"
              icon={<FaBalanceScale />}
              value={asPercent(alignment)}
              hint="Наскільки плейлисти збігаються з прослуховуваннями"
              formula="cos θ = P·L / (‖P‖·‖L‖)"
            />
          </TilesGridStyled>

          <ChartsGridStyled>
            <ChartCard
              title="Активність прослуховування"
              subtitle={`Прослуховування за день, останні ${ACTIVITY_DAYS} днів · у середньому ${formatNumber(avgPerDay, 1)}/день`}
              chart={
                <ColumnChart points={activityPoints} valueLabel="Прослуховування" />
              }
              table={
                <DataTable
                  rowKey={(row) => row.date}
                  rows={[...user.playsByDay].reverse()}
                  columns={[
                    {
                      header: "День",
                      render: (row) =>
                        formatDay(row.date, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }),
                    },
                    {
                      header: "Прослуховування",
                      render: (row) => row.plays,
                      numeric: true,
                    },
                  ]}
                />
              }
              formula={
                <>
                  <code>plays(d) = |{"{"} e : date(e) = d {"}"}|</code> — кількість
                  прослуховувань за день d; середнє{" "}
                  <code>= Σ plays(d) / {ACTIVITY_DAYS}</code> (дні групуються за
                  UTC)
                </>
              }
            />

            <ChartCard
              title="Прослуховування за жанрами"
              subtitle="Що ви слухаєте насправді"
              chart={
                <BarList
                  valueLabel="Прослуховування"
                  rows={user.playsByGenre.map((row) => ({
                    label: row.genre,
                    value: row.plays,
                  }))}
                />
              }
              table={
                <DataTable
                  rowKey={(row) => row.genre}
                  rows={user.playsByGenre}
                  columns={[
                    { header: "Жанр", render: (row) => row.genre },
                    {
                      header: "Прослуховування",
                      render: (row) => row.plays,
                      numeric: true,
                    },
                    {
                      header: "Частка",
                      render: (row) => formatPercent(listenShare(row)),
                      numeric: true,
                    },
                  ]}
                />
              }
              formula={
                <>
                  <code>share(g) = plays(g) / Σ plays × 100%</code> — частка жанру
                  g серед усіх прослуховувань; жанр фіксується в момент
                  відтворення треку
                </>
              }
            />
          </ChartsGridStyled>

          <ChartsGridStyled>
            <ChartCard
              title="Ваш смак vs. ваша бібліотека"
              subtitle="Частка жанру у прослуховуваннях порівняно з треками, збереженими в плейлистах"
              legend={tasteSeries}
              chart={<CompareBars rows={tasteRows} series={tasteSeries} />}
              table={
                <DataTable
                  rowKey={(row) => row.label}
                  rows={tasteRows}
                  columns={[
                    { header: "Жанр", render: (row) => row.label },
                    {
                      header: "У прослуховуваннях",
                      render: (row) => formatPercent(row.values[0]),
                      numeric: true,
                    },
                    {
                      header: "У плейлистах",
                      render: (row) => formatPercent(row.values[1]),
                      numeric: true,
                    },
                  ]}
                />
              }
              formula={
                <>
                  <code>P(g) = plays(g) / Σ plays</code>,{" "}
                  <code>L(g) = tracks(g) / Σ tracks</code> — частки жанру в
                  прослуховуваннях і в плейлистах. Загальна відповідність{" "}
                  <code>cos(P, L) = {asPercent(alignment)}</code> — та сама
                  косинусна міра, якою рекомендаційна система порівнює треки
                </>
              }
            />

            <ChartCard
              title="Найпопулярніші треки"
              subtitle="Ваш топ-5 за кількістю прослуховувань"
              chart={
                <DataTable
                  rowKey={(row) => row.id}
                  rows={user.topTracks}
                  columns={[
                    {
                      header: "Трек",
                      render: (row) => (
                        <span style={{ textTransform: "none" }}>
                          {row.trackName}
                          <span
                            style={{
                              display: "block",
                              fontSize: 12,
                              color: chartTheme.inkMuted,
                            }}
                          >
                            {row.artistName}
                          </span>
                        </span>
                      ),
                    },
                    {
                      header: "Жанр",
                      render: (row) => (
                        <span style={{ textTransform: "capitalize" }}>
                          {row.genre}
                        </span>
                      ),
                    },
                    {
                      header: "Прослуховування",
                      render: (row) => row.plays,
                      numeric: true,
                    },
                  ]}
                />
              }
              formula={
                <>
                  Рейтинг за{" "}
                  <code>plays(t) = |{"{"} e : track(e) = t {"}"}|</code> — кількістю
                  прослуховувань треку t, за спаданням
                </>
              }
            />
          </ChartsGridStyled>
        </StatsSection>

        <RecommenderQualitySection
          section={SECTIONS.recommender}
          index={sectionIndex(SECTIONS.recommender)}
        />

        <StatsSection
          section={SECTIONS.ads}
          index={sectionIndex(SECTIONS.ads)}
          icon={<FaBullhorn />}
          title="Реклама, яку ви чули"
          subtitle="Реклама запускається під час прослуховування; у групі A вона підбирається під жанр треку."
        >
          <InsightStyled $accent={SECTIONS.ads.accent}>
            <FaLightbulb />
            <span>
              {summary.adImpressions ? (
                <>
                  Ви почули <b>{summary.adImpressions}</b> реклам —{" "}
                  {asPercent(adLoad)} ваших прослуховувань (очікувано{" "}
                  {asPercent(model.adChance)}).
                  {topBrand && (
                    <>
                      {" "}
                      Найчастіше до вас доходив рекламодавець{" "}
                      <b>{topBrand.brand}</b>.
                    </>
                  )}{" "}
                  Ваші прослуховування принесли{" "}
                  <b>{formatMoney(summary.estimatedRevenue)}</b> симульованого
                  доходу від реклами.
                </>
              ) : (
                "Ви ще не чули жодної реклами."
              )}
            </span>
          </InsightStyled>

          <TilesGridStyled>
            <StatTile
              label="Почуто реклам"
              icon={<FaBullhorn />}
              value={formatCompact(summary.adImpressions)}
              formula="I = |покази реклами|"
            />
            <StatTile
              label="Кліки по рекламі"
              icon={<FaMousePointer />}
              value={formatCompact(summary.adClicks)}
              formula="C = |кліки «Learn more»|"
            />
            <StatTile
              label="Ваш CTR"
              icon={<FaPercent />}
              value={formatPercent(summary.ctr)}
              formula="CTR = C / I × 100%"
            />
            <StatTile
              label="Рекламне навантаження"
              icon={<FaLayerGroup />}
              value={asPercent(adLoad)}
              hint={`Очікувано ${asPercent(model.adChance)}`}
              formula="I / N"
            />
            <StatTile
              label="Згенерований вами дохід"
              icon={<FaDollarSign />}
              value={formatMoney(summary.estimatedRevenue)}
              hint="Симульовано"
              formula="R = Σ rᵢ"
            />
          </TilesGridStyled>

          <ChartsGridStyled>
            <ChartCard
              title="Реклама за брендами"
              subtitle="Як часто кожен рекламодавець до вас доходив"
              chart={
                <BarList
                  valueLabel="Покази"
                  rows={user.adsByBrand.map((row) => ({
                    label: row.brand,
                    value: row.impressions,
                  }))}
                />
              }
              table={
                <DataTable
                  rowKey={(row) => row.brand}
                  rows={user.adsByBrand}
                  columns={[
                    { header: "Бренд", render: (row) => row.brand },
                    {
                      header: "Покази",
                      render: (row) => row.impressions,
                      numeric: true,
                    },
                    { header: "Кліки", render: (row) => row.clicks, numeric: true },
                  ]}
                />
              }
              formula={
                <>
                  Кампанія обирається рівноймовірно з тих, що таргетовані на
                  жанр треку: <code>P(c | g) = 1 / |C_g|</code> (у групі B — з
                  усіх кампаній)
                </>
              }
            />

            <ChartCard
              title="Реклама за жанрами"
              subtitle="Які з ваших жанрів запускали рекламу"
              chart={
                <BarList
                  valueLabel="Покази"
                  rows={user.adsByGenre.map((row) => ({
                    label: row.genre,
                    value: row.impressions,
                  }))}
                />
              }
              table={
                <DataTable
                  rowKey={(row) => row.genre}
                  rows={user.adsByGenre}
                  columns={adGenreColumns}
                />
              }
              formula={
                <>
                  <code>E[I(g)] = p · plays(g)</code> з{" "}
                  <code>p = {model.adChance}</code> — очікувана кількість показів у
                  жанрі; CTR і дохід за жанрами — у вкладці «Таблиця»
                </>
              }
            />
          </ChartsGridStyled>
        </StatsSection>

        <AbTestSection
          section={SECTIONS.abTest}
          index={sectionIndex(SECTIONS.abTest)}
          abTest={abTest}
        />

        <StatsSection
          section={SECTIONS.platform}
          index={sectionIndex(SECTIONS.platform)}
          icon={<FaGlobe />}
          title="Як заробляє платформа"
          subtitle="Ефективність реклами по всіх користувачах — модель монетизації загалом."
        >
          <InsightStyled $accent={SECTIONS.platform.accent}>
            <FaLightbulb />
            <span>
              Платформа показала <b>{formatCompact(platformAds.impressions)}</b>{" "}
              реклам і заробила <b>{formatMoney(platformAds.revenue)}</b>{" "}
              (симульовано) — eCPM <b>{formatMoney(platformEcpm)}</b> при
              очікуваних {formatMoney(expectedEcpm)}.
              {topRevenueGenre && (
                <>
                  {" "}
                  Найбільше доходу приносять слухачі жанру{" "}
                  <b>{topRevenueGenre.genre}</b>.
                </>
              )}
            </span>
          </InsightStyled>

          <TilesGridStyled>
            <StatTile
              label="Покази"
              icon={<FaBullhorn />}
              value={formatCompact(platformAds.impressions)}
            />
            <StatTile
              label="Кліки"
              icon={<FaMousePointer />}
              value={formatCompact(platformAds.clicks)}
            />
            <StatTile
              label="CTR"
              icon={<FaPercent />}
              value={formatPercent(platformAds.ctr)}
              formula="CTR = C / I × 100%"
            />
            <StatTile
              label="Загальний дохід"
              icon={<FaDollarSign />}
              value={formatMoney(platformAds.revenue)}
              hint="Симульовано"
              formula="R = Σ rᵢ"
            />
            <StatTile
              label="eCPM"
              icon={<FaCoins />}
              value={formatMoney(platformEcpm)}
              hint={`Очікувано ${formatMoney(expectedEcpm)}`}
              formula="eCPM = R / I × 1000"
            />
          </TilesGridStyled>

          <ChartsGridStyled>
            <ChartCard
              title="Дохід за жанрами"
              subtitle="Оцінка доходу від реклами за жанром прослуховування"
              chart={
                <BarList
                  valueLabel="Дохід"
                  formatValue={formatMoney}
                  rows={platformAds.byGenre
                    .map((row) => ({ label: row.genre, value: row.revenue }))
                    .sort((a, b) => b.value - a.value)}
                />
              }
              table={
                <DataTable
                  rowKey={(row) => row.genre}
                  rows={platformAds.byGenre}
                  columns={adGenreColumns}
                />
              }
              formula={
                <>
                  <code>R(g) = Σ rᵢ</code> — сума доходу з усіх показів у жанрі g,
                  де{" "}
                  <code>
                    rᵢ ~ U({model.minRevenue}, {model.maxRevenue})
                  </code>
                </>
              }
            />

            <ChartCard
              title="CTR за жанрами"
              subtitle="Частка показів, що завершились кліком"
              chart={
                <BarList
                  valueLabel="CTR"
                  formatValue={formatPercent}
                  rows={platformAds.byGenre
                    .map((row) => ({ label: row.genre, value: row.ctr }))
                    .sort((a, b) => b.value - a.value)}
                />
              }
              table={
                <DataTable
                  rowKey={(row) => row.genre}
                  rows={platformAds.byGenre}
                  columns={adGenreColumns}
                />
              }
              formula={
                <>
                  <code>CTR(g) = clicks(g) / impressions(g) × 100%</code> — за
                  малої кількості показів значення нестабільне, тому зважайте на
                  абсолютні числа у вкладці «Таблиця»
                </>
              }
            />
          </ChartsGridStyled>

          <NoteStyled>
            Рекламні кампанії та дохід симульовані для демонстрації.
          </NoteStyled>
        </StatsSection>

        <StatsSection
          section={SECTIONS.methodology}
          index={sectionIndex(SECTIONS.methodology)}
          icon={<FaBook />}
          title="Методологія"
          subtitle="Формули та припущення, що стоять за кожним числом на цій сторінці."
        >
          <StatsMethodology
            adChance={model.adChance}
            minRevenue={model.minRevenue}
            maxRevenue={model.maxRevenue}
            diversityLabel={asPercent(diversity)}
            alignmentLabel={asPercent(alignment)}
            platformEcpm={platformEcpm}
          />
        </StatsSection>
      </StatsContentStyled>
    </StatsPageStyledWrapper>
  );
};
