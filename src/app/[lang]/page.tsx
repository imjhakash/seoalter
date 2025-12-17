import LandingPage from "@/components/LandingPage";
import { getDictionary } from "@/lib/get-dictionary";

export default async function Home({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <LandingPage lang={lang} dict={dict} />;
}
