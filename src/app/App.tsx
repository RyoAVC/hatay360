import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ContentProvider } from "./context/content-context";
import { AuthProvider } from "./context/auth-context";
import { Suspense } from "react";
import { CustomerAuthProvider } from "./context/customer-auth-context";

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <ContentProvider>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#f7fbfd] text-[14px] font-semibold text-[#4b5c71]">
              Hatay360 yükleniyor…
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
        </ContentProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
