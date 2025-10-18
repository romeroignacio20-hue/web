import ReusablePageWithLinks from "@/components/pages/ReusablePageWithLinks";
import { platforms } from "@/config/site";
import GP from "@/public/gp.png";

export default function Home() {
  const links = platforms;

  return (
    <ReusablePageWithLinks
      businessLogo={GP}
      logoAlt="Logo Golden"
      titleText="¡Que te diviertas!"
      subtitleText="Jugá tranquilo, nosotros te representamos."
      links={links}
    />
  );
}
