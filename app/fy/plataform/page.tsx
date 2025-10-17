import ReusablePageWithLinks from "@/components/pages/ReusablePageWithLinks";
import { siteConfig } from "@/config/site";
import logoFy from '@/public/LogoFichas.png';

export default function Home() {
    const links = siteConfig.platforms
    return (
    <ReusablePageWithLinks
    businessLogo={logoFy}
    logoAlt="Logo Hero"
    titleText="¡Que te diviertas!"
    subtitleText="Jugá tranquilo, nosotros te representamos."
    links={links}
    rounded={true}
    width={272}
    />
    );
}
