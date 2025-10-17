import ReusablePageWithLinks from "@/components/pages/ReusablePageWithLinks";
import { siteConfig } from "@/config/site";
import logoGolden from "@/public/logoGolden.png"

export default function Home() {
  const links = siteConfig.platforms;

  return (
    <ReusablePageWithLinks
      businessLogo={logoGolden}
      logoAlt="Logo Golden"
      titleText="¡Que te diviertas!"
      subtitleText="Jugá tranquilo, nosotros te representamos."
      links={links}
    />
  );
}
