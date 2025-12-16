import VerifyForm from './VerifyForm';
import { getDictionary } from '@/lib/get-dictionary';

export default async function VerifyPage({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <VerifyForm dict={dict} />;
}
