import ReusablePageWithLinks from "@/components/pages/ReusablePageWithLinks";
import { platforms } from "@/config/site";
import logoGolden from "@/public/logoGolden.png"

export default function Home() {
  const links = platforms;

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
