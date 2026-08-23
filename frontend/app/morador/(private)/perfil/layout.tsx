import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Morador",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
