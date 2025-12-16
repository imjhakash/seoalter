import RegisterForm from './RegisterForm';
import { getDictionary } from '@/lib/get-dictionary';

export default async function RegisterPage({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <RegisterForm dict={dict} />;
}
