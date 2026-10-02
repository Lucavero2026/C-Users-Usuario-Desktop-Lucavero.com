import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog · Administração",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminBlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
