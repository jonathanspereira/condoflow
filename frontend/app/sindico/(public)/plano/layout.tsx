import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planos",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
