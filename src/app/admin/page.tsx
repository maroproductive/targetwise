import { authenticated } from "@/lib/auth";
import { content } from "@/lib/content";
import Admin from "@/components/Admin";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default async function Page() {
  try {
    if (await authenticated()) return <Admin data={await content(true)} />;
    return <Admin />;
  } catch {
    return (
      <Admin problem="Database unavailable. Check MONGODB_URI and Atlas network access." />
    );
  }
}
