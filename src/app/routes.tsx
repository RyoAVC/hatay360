import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import Root from "./root";

const HomePage = lazy(() => import("./pages/home").then((module) => ({ default: module.HomePage })));
const DomainGatewayPage = lazy(() => import("./pages/domain-gateway-page").then((module) => ({ default: module.DomainGatewayPage })));
const FeaturesPage = lazy(() => import("./pages/features-page").then((module) => ({ default: module.FeaturesPage })));
const PazarlaPage = lazy(() => import("./pages/pazarla-page").then((module) => ({ default: module.PazarlaPage })));
const PaketlerPage = lazy(() => import("./pages/paketler-page").then((module) => ({ default: module.PaketlerPage })));
const ReferanslarPage = lazy(() => import("./pages/referanslar-page").then((module) => ({ default: module.ReferanslarPage })));
const HakkimizdaPage = lazy(() => import("./pages/hakkimizda-page").then((module) => ({ default: module.HakkimizdaPage })));
const KurumsalPage = lazy(() => import("./pages/kurumsal-page").then((module) => ({ default: module.KurumsalPage })));
const MisyonPage = lazy(() => import("./pages/misyon-page").then((module) => ({ default: module.MisyonPage })));
const VizyonPage = lazy(() => import("./pages/vizyon-page").then((module) => ({ default: module.VizyonPage })));
const IletisimPage = lazy(() => import("./pages/iletisim-page").then((module) => ({ default: module.IletisimPage })));
const GizlilikPage = lazy(() => import("./pages/gizlilik-page").then((module) => ({ default: module.GizlilikPage })));
const KvkkPage = lazy(() => import("./pages/kvkk-page").then((module) => ({ default: module.KvkkPage })));
const MesafeliPage = lazy(() => import("./pages/mesafeli-page").then((module) => ({ default: module.MesafeliPage })));
const KosullarPage = lazy(() => import("./pages/kosullar-page").then((module) => ({ default: module.KosullarPage })));
const LoginPage = lazy(() => import("./pages/login-page").then((module) => ({ default: module.LoginPage })));
const RequireAuth = lazy(() => import("./components/require-auth").then((module) => ({ default: module.RequireAuth })));
const NotFoundPage = lazy(() => import("./pages/not-found").then((module) => ({ default: module.NotFoundPage })));
const HatayHubPage = lazy(() => import("./pages/hatay-hub-page").then((module) => ({ default: module.HatayHubPage })));
const DistrictPage = lazy(() => import("./pages/district-page").then((module) => ({ default: module.DistrictPage })));
const SectorPage = lazy(() => import("./pages/sector-page").then((module) => ({ default: module.SectorPage })));
const DemoPage = lazy(() => import("./pages/live-demo-page").then((module) => ({ default: module.LiveDemoPage })));
const DemoAdminPage = lazy(() => import("./pages/demo-admin-page").then((module) => ({ default: module.DemoAdminPage })));
const DemoAdminLoginPage = lazy(() => import("./pages/demo-admin-page").then((module) => ({ default: module.DemoAdminLoginPage })));
const DemoOverviewPage = lazy(() => import("./pages/sector-page").then((module) => ({ default: module.DemoOverviewPage })));
const SeoToolsOverviewPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.SeoToolsOverviewPage })));
const GoogleRankFinderPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.GoogleRankFinderPage })));
const MetaTagGeneratorPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.MetaTagGeneratorPage })));
const LocalKeywordGeneratorPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.LocalKeywordGeneratorPage })));
const ReviewInvitePage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.ReviewInvitePage })));
const QrMenuPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.QrMenuPage })));
const NapCheckPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.NapCheckPage })));
const UtmLinkPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.UtmLinkPage })));
const SchemaJsonLdPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.SchemaJsonLdPage })));
const CustomerLinksPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.CustomerLinksPage })));
const VCardPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.VCardPage })));
const MapsLinksPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.MapsLinksPage })));
const HoursPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.HoursPage })));
const ReviewReplyPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.ReviewReplyPage })));
const AppointmentReminderPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.AppointmentReminderPage })));
const ClosedNoticePage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.ClosedNoticePage })));
const NeedsCalculatorPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.NeedsCalculatorPage })));
const AdsRsaPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.AdsRsaPage })));
const SocialOgPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.SocialOgPage })));
const GoogleMapsPage = lazy(() => import("./pages/google-maps-page").then((module) => ({ default: module.GoogleMapsPage })));
const HatayDiscoveryPage = lazy(() => import("./pages/hatay-discovery-page").then((module) => ({ default: module.HatayDiscoveryPage })));
const HatayBreakfastGuidePage = lazy(() => import("./pages/hatay-discovery-page").then((module) => ({ default: module.HatayBreakfastGuidePage })));
const CustomerLoginPage = lazy(() => import("./pages/customer-login-page").then((module) => ({ default: module.CustomerLoginPage })));
const CustomerSignupPage = lazy(() => import("./pages/customer-signup-page").then((module) => ({ default: module.CustomerSignupPage })));
const AccountHubPage = lazy(() => import("./pages/account-hub-page").then((module) => ({ default: module.AccountHubPage })));
const PartnerLoginPage = lazy(() => import("./pages/partner-login-page").then((module) => ({ default: module.PartnerLoginPage })));
const PartnerSignupPage = lazy(() => import("./pages/partner-signup-page").then((module) => ({ default: module.PartnerSignupPage })));
const RequireCustomer = lazy(() => import("./components/require-customer").then((module) => ({ default: module.RequireCustomer })));
const RequirePartner = lazy(() => import("./components/require-partner").then((module) => ({ default: module.RequirePartner })));
const MicrositePage = lazy(() => import("./pages/microsite-page").then((module) => ({ default: module.MicrositePage })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: DomainGatewayPage },
      { path: "ozellikler", Component: FeaturesPage },
      { path: "pazarla", Component: PazarlaPage },
      { path: "paketler", Component: PaketlerPage },
      { path: "referanslar", Component: ReferanslarPage },
      { path: "hakkimizda", Component: HakkimizdaPage },
      { path: "kurumsal", Component: KurumsalPage },
      { path: "misyon", Component: MisyonPage },
      { path: "vizyon", Component: VizyonPage },
      { path: "iletisim", Component: IletisimPage },
      { path: "gizlilik", Component: GizlilikPage },
      { path: "kvkk", Component: KvkkPage },
      { path: "mesafeli-satis", Component: MesafeliPage },
      { path: "kosullar", Component: KosullarPage },
      { path: "hatay", Component: HatayHubPage },
      { path: "hatay/:slug", Component: DistrictPage },
      { path: "demolar", Component: DemoOverviewPage },
      { path: "demo/:slug/panel/giris", Component: DemoAdminLoginPage },
      { path: "demo/:slug/panel", Component: DemoAdminPage },
      { path: "demo/:slug", Component: DemoPage },
      { path: "sektor/:slug", Component: SectorPage },
      { path: "araclar", Component: SeoToolsOverviewPage },
      { path: "araclar/google-sira-bulucu", Component: GoogleRankFinderPage },
      { path: "araclar/meta-etiket-olusturucu", Component: MetaTagGeneratorPage },
      { path: "araclar/yerel-anahtar-kelime-olusturucu", Component: LocalKeywordGeneratorPage },
      { path: "araclar/yorum-mesaji", Component: ReviewInvitePage },
      { path: "araclar/qr-menu", Component: QrMenuPage },
      { path: "araclar/nap-kontrol", Component: NapCheckPage },
      { path: "araclar/utm-link", Component: UtmLinkPage },
      { path: "araclar/schema", Component: SchemaJsonLdPage },
      { path: "araclar/musteri-linki", Component: CustomerLinksPage },
      { path: "araclar/kartvizit", Component: VCardPage },
      { path: "araclar/harita-linki", Component: MapsLinksPage },
      { path: "araclar/calisma-saati", Component: HoursPage },
      { path: "araclar/yorum-cevabi", Component: ReviewReplyPage },
      { path: "araclar/randevu-hatirlatma", Component: AppointmentReminderPage },
      { path: "araclar/kapaliyiz", Component: ClosedNoticePage },
      { path: "araclar/ozel-ihtiyac-hesaplayici", Component: NeedsCalculatorPage },
      { path: "araclar/reklam-metni", Component: AdsRsaPage },
      { path: "araclar/sosyal-onizleme", Component: SocialOgPage },
      { path: "google-maps-harita-kaydi", Component: GoogleMapsPage },
      { path: "hatay-kesfet", Component: HatayDiscoveryPage },
      { path: "hatayda-nerede-kahvalti-yapilir", Component: HatayBreakfastGuidePage },
      { path: "panel/giris", Component: LoginPage },
      { path: "panel", Component: RequireAuth },
      { path: "hesap", Component: AccountHubPage },
      { path: "giris", element: <Navigate to="/hesap" replace /> },
      { path: "musteri/giris", Component: CustomerLoginPage },
      { path: "musteri/kayit", Component: CustomerSignupPage },
      { path: "musteri", Component: RequireCustomer },
      { path: "firma/giris", Component: PartnerLoginPage },
      { path: "firma/kayit", Component: PartnerSignupPage },
      { path: "firma", Component: RequirePartner },
      { path: "admin", element: <Navigate to="/panel" replace /> },
      { path: "s/:slug", Component: MicrositePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
