import ReusablePageWithLinks from "@/components/pages/ReusablePageWithLinks";
import { siteConfig } from "@/config/site";
import logoHero from '@/public/hero.png';

export default function Home() {
    const links = siteConfig.platforms
    return (
    <ReusablePageWithLinks
    businessLogo={logoHero}
    logoAlt="Logo Hero"
    titleText="¡Que te diviertas!"
    subtitleText="Jugá tranquilo, nosotros te representamos."
    links={links}
    />
    );
}
