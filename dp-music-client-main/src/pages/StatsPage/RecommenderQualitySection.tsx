import React, { ReactElement, useEffect, useState } from "react";
import {
  FaBullseye,
  FaExclamationCircle,
  FaLightbulb,
  FaMagic,
  FaSortAmountUp,
  FaTags,
  FaTrophy,
} from "react-icons/fa";
import { userApi } from "../../api/user.api";
import {
  EvaluationVariantInterface,
  RecommenderEvaluationInterface,
} from "../../types/interfaces/Stats.interface";
import {
  formatCompact,
  formatNumber,
  formatPercent,
} from "../../components/shared-components/Charts/chartTheme";
import { ChartCard } from "../../components/shared-components/Charts/ChartCard";
import { BarList } from "../../components/shared-components/Charts/BarList";
import {
  DataTable,
  DataTableColumn,
} from "../../components/shared-components/Charts/DataTable";
import { StatTile } from "../../components/shared-components/Charts/StatTile";
import { StatsSection, StatsSectionMeta } from "./StatsSection";
import {
  CaveatStyled,
  ChartsGridStyled,
  InsightStyled,
  MetaRowStyled,
  StatusMessageStyled,
  TilesGridStyled,
} from "./StatsPage.styled";

const VARIANT_LABELS: Record<EvaluationVariantInterface["id"], string> = {
  blend: "TF-IDF + аудіо (робоча модель)",
  text: "Лише TF-IDF (текст)",
  audio: "Лише аудіоознаки",
  popularity: "Найпопулярніші (базова)",
  random: "Випадкові (базова)",
};

const asPercent = (ratio: number) => formatPercent(Math.round(ratio * 1000) / 10);

interface RecommenderQualitySectionProps {
  section: StatsSectionMeta;
  index: number;
}

export const RecommenderQualitySection = (
  props: RecommenderQualitySectionProps
): ReactElement => {
  const { section, index } = props;
  const [evaluation, setEvaluation] =
    useState<RecommenderEvaluationInterface | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    userApi
      .getRecommenderEvaluation()
      .then(setEvaluation)
      .catch(() => setHasError(true));
  }, []);

  const content = () => {
    if (hasError) {
      return (
        <StatusMessageStyled>
          Не вдалося виконати оцінку — перевірте, чи запущено рекомендаційний
          сервіс.
        </StatusMessageStyled>
      );
    }

    if (!evaluation) {
      return (
        <StatusMessageStyled>
          Виконуємо leave-one-out оцінку по всіх плейлистах… (кілька секунд)
        </StatusMessageStyled>
      );
    }

    if (!evaluation.cases) {
      return (
        <StatusMessageStyled>
          Поки замало плейлистів — для оцінки потрібні плейлисти щонайменше з
          3 треків.
        </StatusMessageStyled>
      );
    }

    const { k } = evaluation;
    const variants = evaluation.variants.map((variant) => ({
      ...variant,
      label: VARIANT_LABELS[variant.id] || variant.label,
    }));
    const production = variants.find((variant) => variant.id === "blend")!;
    const popularity = variants.find((variant) => variant.id === "popularity")!;
    const best = [...variants].sort((a, b) => b.hitRate - a.hitRate)[0];

    const accuracyColumns: DataTableColumn<EvaluationVariantInterface>[] = [
      { header: "Модель", render: (row) => row.label },
      { header: `Hit@${k}`, render: (row) => asPercent(row.hitRate), numeric: true },
      {
        header: `nDCG@${k}`,
        render: (row) => formatNumber(row.ndcg, 3),
        numeric: true,
      },
      { header: "MRR", render: (row) => formatNumber(row.mrr, 3), numeric: true },
      {
        header: `Prec@${k}`,
        render: (row) => asPercent(row.precision),
        numeric: true,
      },
    ];

    const beyondAccuracyColumns: DataTableColumn<EvaluationVariantInterface>[] = [
      { header: "Модель", render: (row) => row.label },
      {
        header: "Збіг жанру",
        render: (row) => asPercent(row.genrePrecision),
        numeric: true,
      },
      { header: "ILD", render: (row) => formatNumber(row.ild, 2), numeric: true },
      {
        header: "Новизна",
        render: (row) => `${formatNumber(row.novelty, 2)} біт`,
        numeric: true,
      },
      {
        header: "Покриття",
        render: (row) => formatPercent(Math.round(row.coverage * 10000) / 100),
        numeric: true,
      },
    ];

    return (
      <>
        <InsightStyled $accent={section.accent}>
          <FaLightbulb />
          <span>
            Якщо сховати один трек із плейлиста, система повертає його у своєму
            топ-{k} у <b>{asPercent(production.hitRate)}</b> випадків, а базова
            модель «найпопулярніші» — у <b>{asPercent(popularity.hitRate)}</b>.
            Крім того, <b>{asPercent(production.genrePrecision)}</b> рекомендацій
            збігаються з жанрами плейлиста.
            {best.id === "blend" &&
              " Поєднання тексту й аудіо працює краще, ніж кожен блок окремо."}
          </span>
        </InsightStyled>

        <MetaRowStyled>
          <span>
            <b>{evaluation.cases}</b> тестових випадків
          </span>
          <span>
            з <b>{evaluation.playlists}</b> плейлистів
          </span>
          <span>
            каталог <b>{formatCompact(evaluation.catalogSize)}</b> треків
          </span>
          <span>
            K = <b>{k}</b>
          </span>
        </MetaRowStyled>

        <TilesGridStyled>
          <StatTile
            label={`Hit rate @${k}`}
            icon={<FaBullseye />}
            value={asPercent(production.hitRate)}
            hint="Схований трек знайдено в топ-K"
            formula="(1/|T|) Σ [h ∈ top-K]"
          />
          <StatTile
            label={`nDCG @${k}`}
            icon={<FaSortAmountUp />}
            value={formatNumber(production.ndcg, 3)}
            hint="Цінує знаходження ближче до початку"
            formula="1 / log₂(rank + 1)"
          />
          <StatTile
            label="MRR"
            icon={<FaTrophy />}
            value={formatNumber(production.mrr, 3)}
            hint={
              production.mrr
                ? `У середньому ≈ на ${Math.max(1, Math.round(1 / production.mrr))}-й позиції`
                : undefined
            }
            formula="avg 1 / rank"
          />
          <StatTile
            label={`Точність жанру @${k}`}
            icon={<FaTags />}
            value={asPercent(production.genrePrecision)}
            hint="Рекомендації в жанрах плейлиста"
            formula="|R ∩ genres(S)| / K"
          />
          <StatTile
            label="Різноманітність списку (ILD)"
            icon={<FaMagic />}
            value={formatNumber(production.ild, 2)}
            hint="0 — однакові треки · 1 — зовсім різні"
            formula="avg (1 − cos(vᵢ, vⱼ))"
          />
        </TilesGridStyled>

        <ChartsGridStyled>
          <ChartCard
            title={`Hit rate @${k} за моделями`}
            subtitle="Робоча модель проти її частин (абляція) і простих базових моделей"
            chart={
              <BarList
                valueLabel={`Hit rate @${k}`}
                formatValue={formatPercent}
                rows={variants.map((variant) => ({
                  label: variant.label,
                  value: Math.round(variant.hitRate * 1000) / 10,
                }))}
              />
            }
            table={
              <DataTable
                rowKey={(row) => row.id}
                rows={variants}
                columns={accuracyColumns}
              />
            }
            formula={
              <>
                Однакові {evaluation.cases} випадків для всіх моделей:{" "}
                <code>HitRate@K = частка випадків, де h ∈ top-K</code>. Порівняння
                з «лише текст» і «лише аудіо» показує внесок кожного блоку ознак
              </>
            }
          />

          <ChartCard
            title="Поза точністю"
            subtitle="Збіг жанру, різноманітність, новизна та покриття каталогу"
            chart={
              <DataTable
                rowKey={(row) => row.id}
                rows={variants}
                columns={beyondAccuracyColumns}
              />
            }
            formula={
              <>
                <code>ILD = avg(1 − cos)</code> — різноманітність списку,{" "}
                <code>Novelty = avg −log₂((pop + 1) / 101)</code> — «нетривіальність»,{" "}
                <code>Coverage = |∪R| / |catalog|</code> — частка каталогу
              </>
            }
          />
        </ChartsGridStyled>

        <CaveatStyled>
          <FaExclamationCircle />
          <span>
            Більшість плейлистів тут згенеровані самою рекомендаційною системою,
            тож вона частково перевіряється на власних результатах і абсолютна
            точність завищена. Порівняння з базовими моделями залишається
            коректним; для незміщеної оцінки потрібні плейлисти, складені
            вручну.
          </span>
        </CaveatStyled>
      </>
    );
  };

  return (
    <StatsSection
      section={section}
      index={index}
      icon={<FaMagic />}
      title="Наскільки добрі рекомендації?"
      subtitle="Офлайн-тест leave-one-out: ховаємо трек із плейлиста й перевіряємо, чи знайде його рекомендаційна система."
    >
      {content()}
    </StatsSection>
  );
};
