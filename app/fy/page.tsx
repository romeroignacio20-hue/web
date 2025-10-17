'use client';

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import ReusablePage from "@/components/pages/ReusablePage";
import { Particles } from "@/components/magicui/particles";
import logoFy from '@/public/LogoFichas.png';

export default function Hero() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");
  const [currentNumber, setCurrentNumber] = useState<string | null>(null);

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  }, [resolvedTheme]);

  // Fetch inicial del número actual desde el backend
  useEffect(() => {
    const fetchCurrentNumber = async () => {
      try {
        const response = await fetch("/api/clicks-redis?business=Hero", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentNumber(data.currentNumber);
        } else {
          console.error("Error en la respuesta del servidor");
        }
      } catch (error) {
        console.error("Error al obtener el número actual:", error);
      }
    };

    fetchCurrentNumber();
  }, []);

  // Evitar renderizar algo distinto en SSR y CSR
  if (currentNumber === null) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
        <span className="pointer-events-none z-10 whitespace-pre-wrap text-center text-2xl font-semibold leading-none">
          Cargando...
        </span>
        <Particles
          className="absolute inset-0 z-0"
          quantity={100}
          ease={80}
          color={color}
          staticity={30}
          size={2}
          refresh
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
      <div className="z-10">
        <ReusablePage
          logoSrc={logoFy}
          businessName="Fichas Ya"
          whatsappLink={currentNumber}
          rounded={true}
          width={252}
        />
      </div>
      <Particles
        className="absolute inset-0 z-0"
        quantity={150}
        ease={80}
        color={color}
        staticity={30}
        size={2}
        refresh
      />
    </div>
  );
}