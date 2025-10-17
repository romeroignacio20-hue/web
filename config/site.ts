import logoGanamos from "@/public/logo.png";
import logoApostamos from "@/public/logo-apostamos.png";
import logoArgenbet from "@/public/logo-argenbet.png"


export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'GoldenBot',
  description: 'Usa esta Web Cada vez que quieras contactarnos. Aqui siempre estaremos a tu disposición.',
  descriptionPlataform: 'Jugá tranquilo, nosotros te representamos.',
  whatsappNumbers: {
    principalGolden: [
      'https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!',
      'https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!'
    ],
    descartableHero: [
      'https://api.whatsapp.com/send/?phone=5493512926515&text=Hola%21+Quiero+un+usuario+porfavor%21+&type=phone_number&app_absent=0',
      'https://api.whatsapp.com/send/?phone=5493516300985&text=Hola%21+Quiero+un+usuario+porfavor%21+&type=phone_number&app_absent=0'
    ]
  },
  platforms: [
    {
      href: 'https://argenbet.net',
      logoSrc: logoArgenbet,
      logoAlt: 'Logo Argenbet'
    },
    {
      href: 'https://ganamosnet.io/home',
      logoSrc: logoGanamos,
      logoAlt: 'Logo Ganamos'
    },
    {
      href: 'https://Apostamos.vip',
      logoSrc: logoApostamos,
      logoAlt: 'Logo Apostamos'
    }
  ]
};
