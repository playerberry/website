<script setup lang="ts">
/**
 * CookiesView (`/cookies-policy`)
 *
 * Static Cookie Policy document. Content is presentational prose only — the
 * only component dependency is `RouterLink` for the in-site links.
 * Typography comes from `.prose-pb` (see `assets/css/prose.css`).
 */
import { RouterLink } from "vue-router";
import { useLocalePath } from "../composables/useLocalePath";

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <!-- The legal documents are published in Turkish only, so the root carries
       an explicit `lang` regardless of the active UI locale. -->
  <div lang="tr">
    <section class="section">
      <div class="container-pb">
        <div class="mx-auto max-w-3xl">
          <p class="eyebrow">Yasal</p>
          <h1 class="section-title mt-3">Çerez Politikası</h1>
          <p class="meta-row mt-5">
            <span>Son güncelleme</span>
            <span aria-hidden="true">·</span>
            <span>29 Ağustos 2026</span>
          </p>
          <div class="divider-glow my-10" aria-hidden="true"></div>
          <div class="prose-pb">
            <p>
              Bu Çerez Politikası, çerezlerin ne olduğunu, Web Sitesinin çerez
              kullanıp kullanmadığını ve bunun yerine hangi tarayıcı depolamasını
              hangi amaçla kullandığını açıklar. Bu politikayı okuyarak Cihazınızda
              hangi verilerin saklandığını öğrenebilirsiniz.
            </p>
            <p>
              Çerezler genellikle bir kullanıcıyı kişisel olarak tanımlayan bilgiler
              içermez. Kişisel verilerinizi nasıl kullandığımız, sakladığımız ve
              güvende tuttuğumuz hakkında daha fazla bilgi için Gizlilik Politikamıza
              bakınız.
            </p>
            <p>
              Tarayıcı depolamasında yalnızca bir dil kodu saklanır; e-posta adresi
              veya şifre gibi hassas kişisel bilgiler saklanmaz.
            </p>
            <h2>Yorumlama ve Tanımlar</h2>
            <h3>Yorumlama</h3>
            <p>
              Baş harfi büyük olan kelimeler, aşağıdaki koşullara göre tanımlanmış
              anlamlara sahiptir. Aşağıdaki tanımlar, tekil ya da çoğul olmalarına
              bakılmaksızın aynı anlama sahiptir.
            </p>
            <h3>Tanımlar</h3>
            <p>Bu Çerez Politikası'nda kullanılan terimlerin anlamları:</p>
            <ul>
              <li>
                <strong>Şirket</strong> (bu Çerez Politikası'nda &quot;Şirket&quot;,
                &quot;Biz&quot;, &quot;Bize&quot; ya da &quot;Bizim&quot; olarak
                anılabilir) PlayerBerry'yi ifade eder.
              </li>
              <li>
                <strong>Çerezler</strong>, bir web sitesi tarafından bilgisayarınıza,
                mobil cihazınıza veya diğer cihazlarınıza yerleştirilen ve tarayıcı
                geçmişinizin detaylarını içeren küçük dosyalar anlamına gelir.
              </li>
              <li>
                <strong>Cihaz</strong>, bilgisayar, cep telefonu veya dijital tablet
                gibi Web Sitesine erişim sağlayabilen herhangi bir cihaz anlamına
                gelir.
              </li>
              <li>
                <strong>Tarayıcı Depolaması</strong>, tarayıcınızın Web Sitesi için
                Cihazınızda sakladığı ve yalnızca Web Sitesi tarafından okunabilen
                küçük veri kayıtlarını (localStorage ve sessionStorage) ifade eder.
              </li>
              <li>
                <strong>Web Sitesi</strong>, PlayerBerry'yi ifade eder,
                <RouterLink :to="lp('/')">https://playerberry.com</RouterLink>
                adresinden erişilebilir.
              </li>
              <li>
                <strong>Siz</strong>, Web Sitesine erişen veya onu kullanan bireyi, ya
                da bu bireyin adına hareket eden bir şirketi veya herhangi bir tüzel
                kişiliği ifade eder.
              </li>
            </ul>
            <h2>Çerezlerin ve Tarayıcı Depolamasının Kullanımı</h2>
            <h3>Çerez Kullanmıyoruz</h3>
            <p>
              Web Sitesi kendi adına Çerez yerleştirmez. Hesap, giriş, kimlik
              doğrulama, çerez onayı veya reklam amacıyla herhangi bir Çerez ya da
              izleme teknolojisi kullanılmaz.
            </p>
            <h3>Kullandığımız Tarayıcı Depolaması</h3>
            <p>
              Tarayıcı Depolaması &quot;Kalıcı&quot; veya &quot;Oturum&quot;
              depolaması olabilir. Kalıcı depolama, siz silene kadar Cihazınızda
              kalırken, oturum depolaması web tarayıcınızı kapatır kapatmaz silinir.
            </p>
            <p>
              Aşağıda belirtilen amaçlar doğrultusunda hem oturum hem de kalıcı
              depolamayı kullanıyoruz:
            </p>
            <ul>
              <li>
                <p><strong>Dil Tercihi</strong></p>
                <p>Tür: Kalıcı depolama (localStorage, <code>pb:locale</code>)</p>
                <p>Yönetici: Biz</p>
                <p>
                  Amaç: Web Sitesinde dil seçimini kullandığınızda seçtiğiniz dili
                  hatırlamak ve Web Sitesini her kullandığınızda dil seçimini yeniden
                  yapmanızı önlemek. Bu kayıt yalnızca dil seçimini kullandığınızda
                  oluşturulur.
                </p>
              </li>
              <li>
                <p><strong>Ülkeye Göre Dil Tespiti Önbelleği</strong></p>
                <p>
                  Tür: Oturum depolaması (sessionStorage, <code>pb:geo-locale</code>)
                </p>
                <p>Yönetici: Biz</p>
                <p>
                  Amaç: Kayıtlı bir dil tercihiniz yoksa, ülkenize göre belirlenen
                  varsayılan dili aynı tarayıcı oturumu boyunca saklayarak tespitin
                  her sayfa yüklemesinde yinelenmesini önlemek. Ülke tespitinin nasıl
                  yapıldığı Gizlilik Politikamızda açıklanmıştır.
                </p>
              </li>
            </ul>
            <h3>Tarayıcı Depolamasıyla İlgili Seçenekleriniz</h3>
            <p>
              Web Sitesinin Cihazınızda veri saklamasını istemiyorsanız, tarayıcınızın
              ayarlarından bu web sitesine ait site verilerini silebilir veya site
              verilerinin saklanmasını engelleyebilirsiniz. Bu seçeneği istediğiniz
              zaman kullanabilirsiniz.
            </p>
            <p>
              Site verilerini silerseniz veya engellerseniz, dil tercihiniz
              hatırlanmaz ve Web Sitesi her ziyaretinizde dili yeniden belirler.
            </p>
            <p>
              Çerezleri ve site verilerini silmek veya web tarayıcınızı bunları
              reddetmeye yönlendirmek istiyorsanız, lütfen web tarayıcınızın yardım
              sayfalarına bakın.
            </p>
            <ul>
              <li>
                <p>
                  Chrome web tarayıcısı için lütfen Google'ın bu sayfasını ziyaret
                  edin:
                  <a
                    href="https://support.google.com/accounts/answer/32050"
                    rel="external nofollow noopener"
                    target="_blank"
                    >https://support.google.com/accounts/answer/32050</a
                  >
                </p>
              </li>
              <li>
                <p>
                  Microsoft Edge web tarayıcısı için lütfen Microsoft'un bu sayfasını
                  ziyaret edin:
                  <a
                    href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-6e7c-3dc2-6b71-6a0a14a3a1b6"
                    rel="external nofollow noopener"
                    target="_blank"
                    >https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-6e7c-3dc2-6b71-6a0a14a3a1b6</a
                  >
                </p>
              </li>
              <li>
                <p>
                  Firefox web tarayıcısı için lütfen Mozilla'nın bu sayfasını ziyaret
                  edin:
                  <a
                    href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored"
                    rel="external nofollow noopener"
                    target="_blank"
                    >https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a
                  >
                </p>
              </li>
              <li>
                <p>
                  Safari web tarayıcısı için lütfen Apple'ın bu sayfasını ziyaret
                  edin:
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    rel="external nofollow noopener"
                    target="_blank"
                    >https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a
                  >
                </p>
              </li>
            </ul>
            <p>
              Diğer herhangi bir web tarayıcısı için lütfen web tarayıcınızın resmi
              web sayfalarını ziyaret edin.
            </p>
            <h2>Bize Ulaşın</h2>
            <p>
              Bu Çerez Politikası hakkında herhangi bir sorunuz varsa, bize şu
              yollarla ulaşabilirsiniz:
            </p>
            <ul>
              <li>
                Web sitemizdeki
                <RouterLink :to="lp('/contact')">iletişim sayfamızı</RouterLink> ziyaret
                ederek.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
