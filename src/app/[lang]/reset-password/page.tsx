import ResetPasswordForm from './ResetPasswordForm';
import { getDictionary } from '@/lib/get-dictionary';

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: 'en' | 'nl' | 'it' }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return <ResetPasswordForm dict={dict} />;
}
