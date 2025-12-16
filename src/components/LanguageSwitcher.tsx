'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (locale: string) => {
        if (!pathname) return;
        const segments = pathname.split('/');
        segments[1] = locale; // Replace locale (e.g., /en/dashboard -> /nl/dashboard)
        const newPath = segments.join('/');
        router.push(newPath);
    };

    return (
        <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <Globe className="w-4 h-4" />
            <select
                onChange={(e) => handleLanguageChange(e.target.value)}
                value={pathname?.split('/')[1] || 'en'}
                className="bg-transparent border-none focus:ring-0 cursor-pointer hover:text-white"
            >
                <option value="en" className="bg-zinc-900 text-white">English</option>
                <option value="nl" className="bg-zinc-900 text-white">Nederlands</option>
                <option value="it" className="bg-zinc-900 text-white">Italiano</option>
            </select>
        </div>
    );
}
