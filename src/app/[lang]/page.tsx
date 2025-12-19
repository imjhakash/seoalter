import LandingPage from "@/components/LandingPage";
import { getDictionary } from "@/lib/get-dictionary";
import { cookies } from "next/headers";

export default async function Home({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    // Check for auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const isLoggedIn = !!token?.value;

    return <LandingPage lang={lang} dict={dict} isLoggedIn={isLoggedIn} />;
}
