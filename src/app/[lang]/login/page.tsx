import LoginForm from './LoginForm';
import { getDictionary } from '@/lib/get-dictionary';

export default async function LoginPage({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <LoginForm dict={dict} />;
}
