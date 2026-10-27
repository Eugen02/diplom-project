import React, { ReactElement } from "react";
import { formatMoney } from "../../components/shared-components/Charts/chartTheme";
import {
  MethodologyItemStyled,
  MethodologyListStyled,
  MethodologySubheadingStyled,
  SectionSubtitleStyled,
} from "./StatsPage.styled";

interface StatsMethodologyProps {
  adChance: number;
  minRevenue: number;
  maxRevenue: number;
  diversityLabel: string;
  alignmentLabel: string;
  platformEcpm: number;
}

export const StatsMethodology = (props: StatsMethodologyProps): ReactElement => {
  const {
    adChance,
    minRevenue,
    maxRevenue,
    diversityLabel,
    alignmentLabel,
    platformEcpm,
  } = props;

  const expectedRevenuePerAd = (minRevenue + maxRevenue) / 2;
  const expectedEcpm = expectedRevenuePerAd * 1000;
  const expectedRevenuePer1000Plays = adChance * expectedRevenuePerAd * 1000;

  return (
    <>
      <MethodologySubheadingStyled>Статистика прослуховувань і реклами</MethodologySubheadingStyled>
      <SectionSubtitleStyled>
        Як кожне число на цій сторінці обчислюється з сирих журналів подій.
      </SectionSubtitleStyled>

      <MethodologyListStyled>
        <MethodologyItemStyled>
          <dt>Джерела даних</dt>
          <dd>
            <code>
              PlayHistory(user, track, genre, t) · AdImpression(user, campaign,
              genre, r, variant, t) · AdClick(user, campaign, genre, variant, t)
            </code>
            Кожне прослуховування, показ реклами та клік зберігаються як окрема
            подія; уся статистика — це агрегації над цими колекціями (MongoDB
            aggregation pipelines), що обчислюються під час запиту.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Різноманітність жанрів — нормована ентропія Шеннона</dt>
          <dd>
            <code>
              pᵢ = plays(gᵢ) / N{"\n"}H = −Σ pᵢ · ln pᵢ{"\n"}H_norm = H / ln k ∈
              [0, 1]
            </code>
            k — кількість жанрів, які ви слухали. 0 означає, що всі
            прослуховування належать одному жанру; 1 — що вони розподілені між
            жанрами ідеально рівномірно. Ваше значення: {diversityLabel}.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Відповідність смаку — косинусна подібність</dt>
          <dd>
            <code>
              P = (plays(g₁), …, plays(gₙ)){"\n"}L = (tracks(g₁), …, tracks(gₙ))
              {"\n"}cos θ = Σ Pᵢ·Lᵢ / (‖P‖ · ‖L‖)
            </code>
            Порівнює те, що ви слухаєте, з тим, що зберігаєте в плейлистах.
            Косинус не залежить від довжини вектора, тому абсолютні кількості й
            частки дають однаковий результат — саме ця властивість дозволяє
            рекомендаційній системі порівнювати TF-IDF-вектори треків. Ваше
            значення: {alignmentLabel}.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Модель показу реклами</dt>
          <dd>
            <code>
              P(ad | play) = p = {adChance}
              {"\n"}A: P(campaign c | genre g) = 1 / |C_g|{"\n"}B: P(campaign c) =
              1 / |C|{"\n"}rᵢ ~ U({minRevenue}, {maxRevenue})
            </code>
            Кожне прослуховування — випробування Бернуллі з імовірністю p. У
            групі A кампанія обирається рівноймовірно серед таргетованих на жанр
            треку (або серед нетаргетованих, якщо збігів немає), у групі B — з
            усього пулу кампаній. Дохід із показу генерується за рівномірним
            розподілом.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Очікуваний дохід</dt>
          <dd>
            <code>
              E[r] = (a + b) / 2 = {formatMoney(expectedRevenuePerAd)}
              {"\n"}E[eCPM] = 1000 · E[r] = {formatMoney(expectedEcpm)}
              {"\n"}E[R на 1000 прослуховувань] = 1000 · p · E[r] ={" "}
              {formatMoney(expectedRevenuePer1000Plays)}
            </code>
            a і b — межі діапазону доходу з одного показу. Фактичний eCPM (
            {formatMoney(platformEcpm)}) має наближатися до очікуваного зі
            зростанням кількості показів (закон великих чисел).
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Click-through rate (CTR)</dt>
          <dd>
            <code>CTR = C / I × 100%</code>
            C — кількість кліків «Learn more», I — кількість показів реклами,
            обидва рахуються в одному розрізі (ви, жанр або вся платформа). За
            малого I показник нестабільний — один клік на 23 покази вже дає
            4,3%.
          </dd>
        </MethodologyItemStyled>
      </MethodologyListStyled>

      <MethodologySubheadingStyled>A/B-тест таргетингу реклами</MethodologySubheadingStyled>
      <SectionSubtitleStyled>
        Статистична перевірка: чи справді реклама за жанром отримує більше
        кліків, ніж випадкова.
      </SectionSubtitleStyled>

      <MethodologyListStyled>
        <MethodologyItemStyled>
          <dt>Розподіл на групи</dt>
          <dd>
            <code>group(user) = md5(userId)[0] mod 2 → A | B</code>
            Детермінований поділ 50/50: користувач завжди потрапляє в ту саму
            групу. A — таргетована за жанром реклама, B — випадкова (контроль).
            Враховуються лише покази після запуску експерименту.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Z-тест для двох пропорцій</dt>
          <dd>
            <code>
              p̂ = (C_A + C_B) / (I_A + I_B){"\n"}z = (p_A − p_B) / √(p̂(1 − p̂)(1/I_A
              + 1/I_B)){"\n"}p-value = 2 · (1 − Φ(|z|))
            </code>
            H₀: CTR груп однаковий. Якщо p-value &lt; α = 0.05, різниця
            статистично значуща. Φ — функція розподілу стандартного нормального
            закону.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>95% довірчий інтервал Вілсона</dt>
          <dd>
            <code>
              (p + z²/2n ± z·√(p(1 − p)/n + z²/4n²)) / (1 + z²/n), z = 1.96
            </code>
            Діапазон, у якому з імовірністю 95% лежить справжній CTR групи. На
            відміну від звичайного інтервалу p ± z·√(p(1−p)/n), коректно працює
            при малих n і CTR, близькому до 0.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Необхідний розмір вибірки</dt>
          <dd>
            <code>
              n = (z₁₋α/₂ + z₁₋β)² · (p₁(1 − p₁) + p₂(1 − p₂)) / (p₂ − p₁)²
              {"\n"}p₂ = p₁ · (1 + MDE), MDE = 50%, α = 0.05, 1 − β = 0.8
            </code>
            Скільки показів потрібно в кожній групі, щоб з потужністю 80%
            виявити різницю CTR у 50%. Поки вибірка менша — висновок не робиться.
          </dd>
        </MethodologyItemStyled>
      </MethodologyListStyled>

      <MethodologySubheadingStyled>
        Оцінка якості рекомендацій (leave-one-out)
      </MethodologySubheadingStyled>
      <SectionSubtitleStyled>
        Офлайн-перевірка: чи повертає система трек, який ми навмисно сховали з
        плейлиста.
      </SectionSubtitleStyled>

      <MethodologyListStyled>
        <MethodologyItemStyled>
          <dt>Протокол</dt>
          <dd>
            <code>
              для кожного плейлиста P (|P| ≥ 3) і треку h ∈ P:{"\n"}  S = P \ {"{"}
              h{"}"}, R = top-K(S){"\n"}  hit = [h ∈ R]
            </code>
            Трек h ховаємо, профіль будуємо з решти, перевіряємо, чи потрапив h
            у K = 10 рекомендацій. До 200 випадків, випадкова вибірка з
            фіксованим seed. Ті самі випадки проганяються для всіх варіантів
            моделі.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Метрики точності</dt>
          <dd>
            <code>
              HitRate@K = (1/|T|) Σ hit{"\n"}Precision@K = hit / K{"\n"}nDCG@K =
              1 / log₂(rank + 1){"\n"}MRR = 1 / rank
            </code>
            HitRate — частка випадків, де трек знайдено. nDCG і MRR ще й
            враховують позицію: знайдений першим цінніший, ніж десятим. Для
            одного прихованого треку IDCG = 1, тож nDCG = DCG.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Метрики поза точністю</dt>
          <dd>
            <code>
              GenrePrecision@K = |{"{"}i ∈ R : genre(i) ∈ genres(S){"}"}| / K
              {"\n"}ILD = avg_{"{"}i≠j{"}"} (1 − cos(vᵢ, vⱼ)){"\n"}Novelty = avg −log₂((pop
              + 1) / 101){"\n"}Coverage = |∪ R| / |catalog|
            </code>
            GenrePrecision — чи відповідають рекомендації жанрам плейлиста. ILD
            — різноманітність усередині списку, Novelty — наскільки
            рекомендовані треки «нетривіальні» (менш популярні дають більше біт),
            Coverage — яку частку каталогу система взагалі рекомендує.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>Абляція та базові моделі</dt>
          <dd>
            <code>
              blend: [0.55·t̂ ‖ 0.45·â]{"\n"}text: t̂{"\n"}audio: â{"\n"}popularity:
              top-K за популярністю{"\n"}random: K випадкових треків
            </code>
            Порівняння показує внесок кожного блоку ознак і те, наскільки модель
            краща за тривіальні підходи. Обмеження: більшість плейлистів
            згенеровані самою системою, тож абсолютні значення точності
            завищені; для незміщеної оцінки потрібні плейлисти, складені
            користувачами вручну.
          </dd>
        </MethodologyItemStyled>
      </MethodologyListStyled>

      <MethodologySubheadingStyled>
        Рекомендаційна система (TF-IDF + аудіоознаки)
      </MethodologySubheadingStyled>
      <SectionSubtitleStyled>
        Контентна фільтрація: кожен трек — вектор ознак, рекомендації —
        найближчі за косинусною подібністю треки. Етапи конвеєра по черзі.
      </SectionSubtitleStyled>

      <MethodologyListStyled>
        <MethodologyItemStyled>
          <dt>1. Дані та вибірка</dt>
          <dd>
            <code>quota(g) = max(1, round(M · n_g / n)), M = 150 000</code>
            Датасет Kaggle «Spotify 1 Million Tracks». Дублікати за track_id
            видаляються, пропуски в числових ознаках заповнюються медіаною. Щоб
            індекс лишався швидким, каталог обмежено M треками за
            стратифікованою вибіркою: кожен жанр g отримує квоту, пропорційну
            своїй частці n_g / n, а в межах жанру беруться найпопулярніші треки.
            Так зберігається жанрове різноманіття, на відміну від простого
            head(n).
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>2. Текстовий профіль — TF-IDF</dt>
          <dd>
            <code>
              d = track_name ⊕ artist_name ⊕ genre{"\n"}tf′(t, d) = 1 + ln tf(t,
              d){"\n"}idf(t) = ln((1 + n) / (1 + df(t))) + 1{"\n"}w(t, d) = tf′ ·
              idf,  t̂ = w / ‖w‖₂
            </code>
            Кожен трек — «документ» з назви, виконавця та жанру. Терми — слова
            та біграми (до 20 000 ознак). Сублінійний tf приглушує повтори
            слова, idf знижує вагу частих термів і підсилює рідкісні, тобто
            характерні для конкретного виконавця чи жанру. Вектор нормується до
            одиничної довжини.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>3. Аудіопрофіль — числові ознаки</dt>
          <dd>
            <code>
              x′ = (x − min) / (max − min) ∈ [0, 1]{"\n"}â = x′ / ‖x′‖₂
            </code>
            13 ознак: danceability, energy, key, loudness, mode, speechiness,
            acousticness, instrumentalness, liveness, valence, tempo,
            duration_ms, popularity. Min-Max нормалізація зводить їх до однієї
            шкали (інакше tempo ≈ 120 чи duration_ms ≈ 200 000 домінували б),
            після чого вектор також нормується до одиничної довжини.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>4. Змішування блоків</dt>
          <dd>
            <code>
              v = [α · t̂ ‖ β · â],  α = 0.55, β = 0.45{"\n"}cos(v, v′) = (α² ·
              cos_text + β² · cos_audio) / (α² + β²){"\n"}≈ 0.599 · cos_text +
              0.401 · cos_audio
            </code>
            Обидва блоки мають одиничну довжину до зважування, тож саме α і β
            задають їхній внесок, і жоден блок не «перетягує» подібність через
            масштаб. З формули видно ефективні ваги для пари треків: близько 60%
            схожості дає текст, 40% — звучання.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>5. Профіль смаку плейлиста</dt>
          <dd>
            <code>u = (1 / |S|) · Σ_{"{"}i ∈ S{"}"} vᵢ</code>
            S — треки плейлиста (або seed-треки), відомі індексу. Профіль —
            центроїд їхніх векторів, тобто «усереднений» трек, що поєднує
            текстові й аудіоознаки всього плейлиста.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>6. Пошук найближчих сусідів</dt>
          <dd>
            <code>
              dist(u, v) = 1 − cos(u, v){"\n"}k = N + |S| + 10 → без S і дублікатів
              → top-N{"\n"}повна матриця: n² · 4 B = 150 000² · 4 B ≈ 90 GB
            </code>
            Використовується NearestNeighbors з косинусною метрикою (перебір,
            O(n·D) на запит) замість попарної матриці подібності, яка для 150
            тис. треків займала б ~90 ГБ, а для повного датасету (~1,1 млн) —
            ~4,8 ТБ. Береться k сусідів із запасом, треки самого плейлиста
            виключаються, повертаються N найближчих.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>7. Пояснення рекомендації</dt>
          <dd>
            <code>
              cⱼ = uⱼ · vⱼ / (‖u‖ · ‖v‖){"\n"}cos(u, v) = Σ_text cⱼ + Σ_audio cⱼ
            </code>
            Косинус розкладається на внески окремих ознак, які в сумі дають
            точне значення подібності. Найбільші внески TF-IDF-термів
            показуються як «спільні ключові слова», аудіоознак — як «схоже
            звучання» (бейдж «% match» на сторінці плейлиста).
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>8. Холодний старт</dt>
          <dd>
            <code>S ∩ index = ∅ → top-N за popularity</code>
            Якщо жоден трек плейлиста не знайдено в індексі (або результатів
            менше за N), список доповнюється найпопулярнішими треками каталогу,
            щоб рекомендації ніколи не були порожніми.
          </dd>
        </MethodologyItemStyled>

        <MethodologyItemStyled>
          <dt>9. Використання в застосунку</dt>
          <dd>
            <code>
              «Made for you»: S = 20 випадкових треків обраних жанрів, N = 40
              {"\n"}«Recommended based on this playlist»: S = треки плейлиста, N =
              20
            </code>
            Індекс містить 150 тис. треків, а в базі застосунку — лише частина
            з них. Тому Core API реєструє свій каталог (список track_id) у
            рекомендаційному сервісі, і той ранжує за косинусом тільки треки
            каталогу: точний перебір усіх рядків (одне розріджене множення
            матриці на вектор) з маскою замість k-NN, який не вміє
            фільтрувати. Офлайн-оцінка якості при цьому рахується на повному
            індексі. Артефакти (TF-IDF, scaler, індекс, каталог) кешуються на
            диску, тож перебудова відбувається лише при зміні датасету.
          </dd>
        </MethodologyItemStyled>
      </MethodologyListStyled>
    </>
  );
};
