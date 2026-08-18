import { createBrowserRouter, Navigate } from "react-router";
import { lazy } from "react";
import Root from "./root";

const HomePage = lazy(() => import("./pages/home").then((module) => ({ default: module.HomePage })));
const FeaturesPage = lazy(() => import("./pages/features-page").then((module) => ({ default: module.FeaturesPage })));
const PazarlaPage = lazy(() => import("./pages/pazarla-page").then((module) => ({ default: module.PazarlaPage })));
const PaketlerPage = lazy(() => import("./pages/paketler-page").then((module) => ({ default: module.PaketlerPage })));
const ReferanslarPage = lazy(() => import("./pages/referanslar-page").then((module) => ({ default: module.ReferanslarPage })));
const HakkimizdaPage = lazy(() => import("./pages/hakkimizda-page").then((module) => ({ default: module.HakkimizdaPage })));
const IletisimPage = lazy(() => import("./pages/iletisim-page").then((module) => ({ default: module.IletisimPage })));
const GizlilikPage = lazy(() => import("./pages/gizlilik-page").then((module) => ({ default: module.GizlilikPage })));
const KosullarPage = lazy(() => import("./pages/kosullar-page").then((module) => ({ default: module.KosullarPage })));
const LoginPage = lazy(() => import("./pages/login-page").then((module) => ({ default: module.LoginPage })));
const RequireAuth = lazy(() => import("./components/require-auth").then((module) => ({ default: module.RequireAuth })));
const NotFoundPage = lazy(() => import("./pages/not-found").then((module) => ({ default: module.NotFoundPage })));
const HatayHubPage = lazy(() => import("./pages/hatay-hub-page").then((module) => ({ default: module.HatayHubPage })));
const DistrictPage = lazy(() => import("./pages/district-page").then((module) => ({ default: module.DistrictPage })));
const SectorPage = lazy(() => import("./pages/sector-page").then((module) => ({ default: module.SectorPage })));
const DemoPage = lazy(() => import("./pages/live-demo-page").then((module) => ({ default: module.LiveDemoPage })));
const DemoOverviewPage = lazy(() => import("./pages/sector-page").then((module) => ({ default: module.DemoOverviewPage })));
const SeoToolsOverviewPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.SeoToolsOverviewPage })));
const GoogleRankFinderPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.GoogleRankFinderPage })));
const MetaTagGeneratorPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.MetaTagGeneratorPage })));
const LocalKeywordGeneratorPage = lazy(() => import("./pages/seo-tools-page").then((module) => ({ default: module.LocalKeywordGeneratorPage })));
const GoogleMapsPage = lazy(() => import("./pages/google-maps-page").then((module) => ({ default: module.GoogleMapsPage })));
const HatayDiscoveryPage = lazy(() => import("./pages/hatay-discovery-page").then((module) => ({ default: module.HatayDiscoveryPage })));
const HatayBreakfastGuidePage = lazy(() => import("./pages/hatay-discovery-page").then((module) => ({ default: module.HatayBreakfastGuidePage })));
const CustomerLoginPage = lazy(() => import("./pages/customer-login-page").then((module) => ({ default: module.CustomerLoginPage })));
const RequireCustomer = lazy(() => import("./components/require-customer").then((module) => ({ default: module.RequireCustomer })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "ozellikler", Component: FeaturesPage },
      { path: "pazarla", Component: PazarlaPage },
      { path: "paketler", Component: PaketlerPage },
      { path: "referanslar", Component: ReferanslarPage },
      { path: "hakkimizda", Component: HakkimizdaPage },
      { path: "iletisim", Component: IletisimPage },
      { path: "gizlilik", Component: GizlilikPage },
      { path: "kosullar", Component: KosullarPage },
      { path: "hatay", Component: HatayHubPage },
      { path: "hatay/:slug", Component: DistrictPage },
      { path: "demolar", Component: DemoOverviewPage },
      { path: "demo/:slug", Component: DemoPage },
      { path: "sektor/:slug", Component: SectorPage },
      { path: "araclar", Component: SeoToolsOverviewPage },
      { path: "araclar/google-sira-bulucu", Component: GoogleRankFinderPage },
      { path: "araclar/meta-etiket-olusturucu", Component: MetaTagGeneratorPage },
      { path: "araclar/yerel-anahtar-kelime-olusturucu", Component: LocalKeywordGeneratorPage },
      { path: "google-maps-harita-kaydi", Component: GoogleMapsPage },
      { path: "hatay-kesfet", Component: HatayDiscoveryPage },
      { path: "hatayda-nerede-kahvalti-yapilir", Component: HatayBreakfastGuidePage },
      { path: "panel/giris", Component: LoginPage },
      { path: "panel", Component: RequireAuth },
      { path: "musteri/giris", Component: CustomerLoginPage },
      { path: "musteri", Component: RequireCustomer },
      { path: "admin", element: <Navigate to="/panel" replace /> },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
