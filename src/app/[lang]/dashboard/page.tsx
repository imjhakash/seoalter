import Dashboard from "@/components/Dashboard";
import { getDictionary } from "@/lib/get-dictionary";

export default async function Home({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return <Dashboard lang={lang} dict={dict} />;
}
