import ForgotPasswordForm from './ForgotPasswordForm';
import { getDictionary } from '@/lib/get-dictionary';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <ForgotPasswordForm dict={dict} />;
}
