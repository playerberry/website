# PlayerBerry

[playerberry.com](https://playerberry.com) — PlayerBerry yazılım stüdyosunun
kurumsal web sitesi. Ana sayfa, proje portföyü, blog, dijital ürün mağazası,
hakkımızda/iletişim ve yasal sayfaların yanı sıra sosyal profillere yönlendiren
kısa `/link/<platform>` adreslerini içerir. Site 11 dilde yayınlanır ve dil,
ziyaretçinin ülkesine göre otomatik seçilir.

## Teknoloji yığını

| Alan | Araç |
| --- | --- |
| UI | Vue 3 (`<script setup>`, Composition API), vue-router 5 |
| Dil / derleme | TypeScript, Vite 8 (`vue-tsc` ile tip denetimi) |
| Çok dillilik | vue-i18n 11 — İngilizce paketle gelir, diğer kataloglar tembel yüklenir |
| Stil | UIkit 3 (yalnızca kullanılan bileşenler Less üzerinden içe aktarılır) + özel Less teması (`src/assets/less/`) |
| İçerik | Blog kod blokları için highlight.js; RSS ve sitemap üretimi için `plugins/` altındaki yerel Vite eklentileri |
| Kalite | ESLint (flat config, Vue + TypeScript), Prettier biçimi, Vitest |
| Yayın | GitHub Pages — GitHub Actions ile otomatik, `gh-pages` paketiyle isteğe bağlı elle |

## Gereksinimler

- **Node.js 22 veya üzeri** (CI Node 22 kullanır).
- **pnpm 11** — `package.json` içindeki `packageManager` alanı `pnpm@11.10.0`
  olarak sabitlenmiştir; `corepack enable` ile doğru sürüm otomatik gelir.

```sh
pnpm install
```

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `pnpm dev` | Geliştirme sunucusunu **8086** portunda açar (`strictPort`: port doluysa başka porta kaymaz, hata verip çıkar). |
| `pnpm build` | `vue-tsc -b` ile tip denetimi yapar, ardından `vite build` ile `dist/` üretir (RSS ve sitemap dosyaları da bu adımda yazılır). |
| `pnpm preview` | Üretim çıktısını yine 8086 portunda yerel olarak sunar. |
| `pnpm lint` | ESLint'i tüm depo üzerinde çalıştırır. |
| `pnpm typecheck` | Yalnızca tip denetimi (`vue-tsc -b`). |
| `pnpm test` | Vitest birim testlerini bir kez çalıştırır (`*.test.ts`, kaynakların yanında). |
| `pnpm release` | Önce `build` alır, sonra `dist/` içeriğini `gh-pages` dalına elle yayınlar. Normal akışta gerekmez (bkz. Yayınlama). |

Geliştirme sunucusunda Cloudflare bulunmadığından ülke tespiti başarısız olur
ve site İngilizce açılır; diğer dilleri üst menüdeki dil seçiciden deneyin.

## Dizin yapısı

```
plugins/            Vite eklentileri: rss.ts (rss*.xml), sitemap.ts (sitemap.xml), prerender.ts (dist/<rota>.html kabukları)
public/             Olduğu gibi kopyalanan dosyalar: CNAME, 404.html (SPA geri dönüşü), ikonlar, robots.txt
src/
  main.ts           Uygulama girişi (UIkit, router, i18n, tema, global Icon bileşeni)
  i18n.ts           vue-i18n kurulumu, katalogların tembel yüklenmesi, ülkeye göre dil seçimi
  routes/           Rota tablosu, /link/* yönlendirmeleri ve sayfa meta (title/description/OG) yönetimi
  views/            Sayfalar (Home, Projects, Blog, BlogPost, Store, AboutUs, Contact, yasal sayfalar, 404)
  components/       Header, Footer, ProjectCard, PostCard, CodeBlock, Icon, ScrollProgress
  composables/      usePostContent — blog makalesini aktif dilden (yoksa İngilizceden) okur
  data/             İçerik meta verisi: projects.ts, products.ts, posts.ts
  locales/          Dil katalogları: tr, en, es, fr, de, ru, ko, it, el, ja, zh (.json)
  assets/js/        Vue'dan bağımsız yardımcılar: locales.ts, dates.ts, seo.ts (buildHead), meta.ts, postBlocks.ts, random.ts
  assets/less/      Tema; _main.less UIkit'in seçili bileşenlerini ve site bloklarını içe aktarır
```

## İçerik yönetimi

İçerik ikiye ayrılır: **yapısal meta veri** TypeScript dosyalarında,
**insan tarafından okunan metinler** dil kataloglarında tutulur ve `id`/`slug`
ile eşleştirilir.

### Projeler

- Meta: `src/data/projects.ts` — `id`, `category` (`web` | `mobile` | `design` | `devops`),
  `year`, `tech` (kart çipleri), `gradient`, isteğe bağlı `url` (harici
  "ziyaret et" bağlantısı) ve `featured` (ana sayfada öne çıkar).
- Metin: her `src/locales/<dil>.json` içinde `projects.items.<id>.title` ve
  `projects.items.<id>.description`.

### Mağaza ürünleri

- Meta: `src/data/products.ts` — `id`, `price` (USD; `0` "ücretsiz" etiketi
  basar), `icon`, isteğe bağlı `badge` (`popular` | `new`), `tone` ve `url`.
- Metin: `store.items.<id>.title`, `.description` ve `.category`.

### Blog yazıları

- Meta: `src/data/posts.ts` — `slug` (URL: `/blog/<slug>`), `date`
  (ISO 8601, ör. `2026-07-14`), `minutes`, `tags`, `gradient`. Dizi en yeni
  yazı en üstte olacak şekilde sıralıdır.
- Metin: `blog.posts.<slug>.title`, `.excerpt` ve `.body`. `body` bir dize
  dizisidir; her öğe bir bloktur: `## ` ile başlayan satır bölüm başlığı, `> `
  ile başlayan satır alıntı, ` ``` ` ile çevrili dize kod bloğu, tek ters
  tırnak içindeki metin satır içi koddur.
- Bir katalogda `blog.posts` altında ilgili yazı yoksa makale İngilizce
  içerikle gösterilir; yani her yazının en az İngilizce sürümü bulunmalıdır.
- RSS beslemeleri Türkçe (`/rss.xml`), İngilizce (`/rss-en.xml`) ve İspanyolca
  (`/rss-es.xml`) için üretilir; sitemap statik rotalar + tüm yazıları kapsar.

`src/data/data.test.ts` her projenin ve ürünün her dilde çevirisinin
bulunduğunu doğrular; yeni bir öğe eklerken tüm katalogları güncelleyin.

## Yeni dil ekleme

1. `src/locales/<kod>.json` dosyasını oluşturun (`en.json` ile aynı anahtar
   yapısı). `src/i18n.ts` katalogları `import.meta.glob` ile bulduğundan orada
   bir kayıt gerekmez.
2. `src/assets/js/locales.ts` içinde:
   - `SUPPORTED_LOCALES` dizisine kodu ekleyin,
   - `LOCALE_NAMES` içine dil seçicide görünecek yerel adını yazın,
   - `FEED_PATHS` içine RSS yolunu ekleyin (kendi beslemesi yoksa `/rss-en.xml`),
   - `COUNTRY_LOCALES` içinde bu dile yönlendirilecek ülke kodlarını (ISO
     3166-1 alpha-2) eşleyin.
3. Tarih biçimi için `src/assets/js/dates.ts` içindeki `localeTags` haritasına
   BCP-47 etiketini ekleyin (eklenmezse tarihler İngilizce biçimlenir).
4. `src/assets/js/seo.ts` içindeki `OG_LOCALES` (Open Graph, ör. `de_DE`) ve
   `HREFLANG` (BCP-47, ör. `de`) haritalarına girdi ekleyin; ikisi de
   `Record<Locale, …>` olduğundan tip denetimi bunu zaten zorunlu kılar.

### Dil nasıl seçilir?

Dil tarayıcı diline göre değil, ziyaretçinin **ülkesine** göre seçilir:

1. Adresteki dil öneki (`/tr/projects`; arama motorlarının dizinlediği dil
   sürümü URL'leri, bkz. "SEO") o ziyaret için her şeyin önündedir; kalıcı
   olarak saklanmaz. Eski `?lang=<kod>` adresleri önekli biçime yönlendirilir.
2. Üst menüden elle seçilmiş bir dil (`localStorage` → `pb:locale`) sonraki
   ziyaretlerde ülke tespitinin önüne geçer. Dil değiştirmek aynı sayfanın o
   dildeki adresine gider (`/tr/projects`); router'daki dil koruyucusu
   (`localeGuard`) kataloğu yükleyip dili etkinleştirir. Öneksiz bir adres,
   etkin dil İngilizce değilse o dilin önekine yönlendirilir; şablonlardaki
   bağlantılar `useLocalePath()` ile zaten önekli üretilir.
3. Aksi hâlde Cloudflare'ın aynı kaynaktaki `/cdn-cgi/trace` uç noktasından
   `loc=XX` satırı okunur ve `COUNTRY_LOCALES` ile dile çevrilir. Sonuç oturum
   boyunca `sessionStorage` (`pb:geo-locale`) içinde saklanır.
4. Eşlenmemiş ülke, zaman aşımı (1,5 s) veya ağ hatası durumunda İngilizce
   kullanılır. Dil çözümlenmeden uygulama monte edilmez; böylece yanlış dilde
   bir ilk kare oluşmaz.

## SEO

Site tek sayfalık bir uygulama olsa da arama motorları ve sosyal medya
önizleyicileri için sayfa başına doğru meta veriyle sunulur:

- **Dil sürümü URL'leri.** Varsayılan dil (İngilizce) temiz adreste
  (`/projects`), diğer diller kendi öneklerinde (`/tr/projects`, ana sayfa
  `/tr/`) yaşar. Her sayfa kendi dil
  sürümünü `canonical` olarak gösterir ve tüm sürümleri `hreflang`
  (`x-default` = temiz adres) ile listeler; blog yazıları yalnızca çevirisi
  bulunan dilleri (`ARTICLE_LOCALES`) listeler, diğer dillerde İngilizce
  sürümü canonical alır. Böylece Google, tarayıcısının ülkesine göre
  gösterilen tek bir dili değil her dili ayrı ayrı dizinleyebilir.
- **Tek kaynak.** Başlık, açıklama, canonical, hreflang, Open Graph /
  Twitter etiketleri, `robots` ve JSON-LD (BreadcrumbList, BlogPosting)
  `src/assets/js/seo.ts` içindeki saf `buildHead()` ile üretilir.
  Çalışma zamanında `src/assets/js/meta.ts` bunu DOM'a uygular (router her
  gezinmede ve dil değişiminde çağırır; blog yazısı kendi verisini geçer).
- **Önceden üretilmiş kabuklar.** `plugins/prerender.ts`, derlemeden sonra
  her dizinlenebilir rota ve her dil için bir kabuk yazar: `dist/projects.html`,
  `dist/tr/projects.html`, `dist/tr/index.html`, `dist/blog/<slug>.html` …
  Her kabuk `index.html`'in `<!-- seo:start -->` / `<!-- seo:end -->`
  işaretleri arasındaki bloğunu o sayfanın o dildeki meta verisiyle
  değiştirir ve `<html lang>` değerini ayarlar. GitHub Pages `/tr/projects`
  isteğini `tr/projects.html` ile karşıladığından tarayıcılar `404.html`
  yönlendirmesi yerine doğrudan `200` ve doğru meta veri alır; JavaScript
  çalıştırmayan sosyal medya önizleyicileri de her dilde sayfaya özgü
  başlık/açıklama görür.
- **Site geneli veri.** `index.html` içinde Organization/WebSite JSON-LD ve
  paylaşım görseli sabittir. `plugins/sitemap.ts` her sayfayı her dil
  sürümüyle (`xhtml:link` alternatifleriyle) listeler; `robots.txt` sitemap'i
  işaret eder. 404 ve `/link/*` rotaları `noindex` alır.
- Sayfa başlıkları `meta.titles.*`, açıklamalar `meta.*` ve paylaşım görseli
  alt metni `meta.ogAlt` anahtarlarında, 11 dilde tutulur.

## Yayınlama

Canlı site GitHub Pages üzerinde, `gh-pages` dalından ve `public/CNAME`
sayesinde `playerberry.com` alan adıyla yayınlanır. Derin bağlantılar için
`public/404.html`, istenen adresi `sessionStorage`'a yazıp ana sayfaya
yönlendirir; `index.html` bu adresi router açılmadan geri yükler.

Akış (`.github/workflows/deploy.yml`):

1. `stage` dalına push edin (veya bir pull request açın).
2. `check` işi lint, typecheck ve testleri çalıştırır. Aynı dala yeni bir push
   gelirse devam eden denetim iptal edilir.
3. Yalnızca `stage` dalındaki push'larda (pull request'lerde değil) `deploy`
   işi `pnpm build` alır ve `dist/` çıktısını `gh-pages` dalına gönderir.
   Yayınlar iptal edilmez, sıraya alınır; böylece yarım kalan bir push olmaz.

İş akışı Actions sekmesinden elle de tetiklenebilir; ancak dağıtım yine
yalnızca `stage` dalı seçildiğinde yapılır, başka bir dal seçilirse sadece
denetimler koşar. Acil bir durumda yerelden `pnpm release` ile de yayın
yapılabilir; bu komut önce derleme alır, sonra `gh-pages` dalına push eder.

## Kod standartları

- Kod yorumları ve JSDoc İngilizce yazılır; dosyalar Prettier biçimindedir.
- Vue tarafından bağımsız mantık (`src/assets/js/`) Vue içe aktarmayan saf
  modüller olarak tutulur ve yanlarındaki `*.test.ts` dosyalarıyla test edilir.
- Yeni kod göndermeden önce `pnpm lint && pnpm typecheck && pnpm test`
  temiz geçmelidir; CI aynı üçlüyü çalıştırır.
