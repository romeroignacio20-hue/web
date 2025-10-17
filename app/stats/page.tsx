'use client';

import { useEffect, useState } from "react";
import StatsChart from "@/components/stats/StatsChart";
import StatsDisplay from "@/components/stats/StatsDisplay";
import ConfigForm from "@/components/stats/ConfigForm";
import PasswordModal from "@/components/stats/PasswordModal";

interface Stats {
  clickCount: number;
  uniqueUsers: number;
  currentNumber: string;
  last7Days: {
    date: string;
    clicks: number;
  }[];
}

interface SiteConfigType {
  name: string;
  description: string;
  descriptionPlataform: string;
  whatsappNumbers: {
    principalGolden: string[];
    descartableHero: string[];
  };
  platforms: string[];
}

export default function StatsPage() {
  const [heroStats, setHeroStats] = useState<Stats | null>(null);
  const [goldenBotStats, setGoldenBotStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<SiteConfigType | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch de Hero
        const heroResponse = await fetch("/api/clicks-redis?business=Hero", {
          method: "GET",
        });
        const goldenBotResponse = await fetch("/api/clicks-redis?business=GoldenBot", {
          method: "GET",
        });

        if (!heroResponse.ok || !goldenBotResponse.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        const heroData = await heroResponse.json();
        const goldenBotData = await goldenBotResponse.json();

        setHeroStats(heroData);
        setGoldenBotStats(goldenBotData);

        // Crear datos históricos combinados para el gráfico
        const combinedChartData = [];
        
        // Si tenemos datos de los últimos 7 días
        if (heroData.last7Days && goldenBotData.last7Days) {
          for (let i = 0; i < 7; i++) {
            // Estimamos usuarios únicos por día (esto es un ejemplo, ajusta según tus datos reales)
            const heroUsers = Math.round(heroData.last7Days[i].clicks * (heroData.uniqueUsers / heroData.clickCount));
            const goldenBotUsers = Math.round(goldenBotData.last7Days[i].clicks * (goldenBotData.uniqueUsers / goldenBotData.clickCount));
            
            combinedChartData.push({
              date: heroData.last7Days[i].date,
              hero: heroData.last7Days[i].clicks,
              goldenBot: goldenBotData.last7Days[i].clicks,
              heroUsers: heroUsers || 0,
              goldenBotUsers: goldenBotUsers || 0
            });
          }
        } else {
          // Datos de ejemplo si no hay datos históricos
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const heroClicks = i === 0 ? heroData.clickCount : Math.floor(Math.random() * 10);
            const goldenBotClicks = i === 0 ? goldenBotData.clickCount : Math.floor(Math.random() * 10);
            
            // Estimamos usuarios únicos
            const heroUsers = Math.round(heroClicks * (heroData.uniqueUsers / Math.max(1, heroData.clickCount)));
            const goldenBotUsers = Math.round(goldenBotClicks * (goldenBotData.uniqueUsers / Math.max(1, goldenBotData.clickCount)));
            
            combinedChartData.push({
              date: dateStr,
              hero: heroClicks,
              goldenBot: goldenBotClicks,
              heroUsers: heroUsers || 0,
              goldenBotUsers: goldenBotUsers || 0
            });
          }
        }
        

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setConfigLoading(true);
        const response = await fetch("/api/config-redis", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Error al obtener la configuración");
        }

        const configData = await response.json();
        setConfig(configData);
      } catch (err) {
        setConfigError((err as Error).message);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleConfigChange = (section: string, field: string, value: string | string[]) => {
    setConfig((prevConfig) => {
      if (!prevConfig) return null;

      const newConfig = { ...prevConfig };

      if (section === 'root') {
        // Manejar los campos de nivel raíz de forma individual
        if (field === 'name') {
          newConfig.name = value as string;
        } else if (field === 'description') {
          newConfig.description = value as string;
        } else if (field === 'descriptionPlataform') {
          newConfig.descriptionPlataform = value as string;
        }
      } else if (section === 'whatsappNumbers.principalGolden') {
        if (Array.isArray(value)) {
          newConfig.whatsappNumbers.principalGolden = value;
        } else {
          // Para compatibilidad con cambios individuales por índice
          const index = parseInt(field);
          if (!isNaN(index)) {
            const newNumbers = [...newConfig.whatsappNumbers.principalGolden];
            newNumbers[index] = value;
            newConfig.whatsappNumbers.principalGolden = newNumbers;
          }
        }
      } else if (section === 'whatsappNumbers.descartableHero') {
        if (Array.isArray(value)) {
          newConfig.whatsappNumbers.descartableHero = value;
        } else {
          // Para compatibilidad con cambios individuales por índice
          const index = parseInt(field);
          if (!isNaN(index)) {
            const newNumbers = [...newConfig.whatsappNumbers.descartableHero];
            newNumbers[index] = value;
            newConfig.whatsappNumbers.descartableHero = newNumbers;
          }
        }
      }

      return newConfig;
    });
  };

  // Funciones para agregar y quitar números
  const addNumber = (businessType: 'principalGolden' | 'descartableHero') => {
    setConfig((prevConfig) => {
      if (!prevConfig) return null;
      
      const newConfig = { ...prevConfig };
      newConfig.whatsappNumbers[businessType] = [...newConfig.whatsappNumbers[businessType], ''];
      
      return newConfig;
    });
  };

  const removeNumber = (businessType: 'principalGolden' | 'descartableHero', index: number) => {
    setConfig((prevConfig) => {
      if (!prevConfig) return null;
      
      const newConfig = { ...prevConfig };
      newConfig.whatsappNumbers[businessType] = newConfig.whatsappNumbers[businessType].filter((_, i) => i !== index);
      
      return newConfig;
    });
  };

  const saveConfig = async () => {
    try {
      // Mostrar el modal de contraseña
      setShowPasswordModal(true);
    } catch (err) {
      console.error("Error en saveConfig:", err);
      setConfigError((err as Error).message);
    }
  };

  // Función para verificar la contraseña y guardar la configuración
  const verifyPasswordAndSave = async (password: string) => {
    try {
      // Verificar la contraseña en el servidor
      const verifyResponse = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok || !verifyData.success) {
        setPasswordError(verifyData.message || "Contraseña incorrecta");
        return;
      }
      
      // Limpiar error de contraseña si existe
      setPasswordError(null);
      
      // Cerrar el modal
      setShowPasswordModal(false);
      
      // Enviar la configuración al servidor
      const response = await fetch("/api/config-redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      console.log("Respuesta del backend:", response);

      if (!response.ok) {
        // Intentar extraer el mensaje de error detallado del backend
        let errorMsg = "Error al guardar la configuración";
        try {
          const errorData = await response.json();
          console.error("Respuesta de error del backend:", errorData);
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          console.error("Error al parsear el error del backend:", e);
        }
        throw new Error(errorMsg);
      }

      setSuccessMessage("Configuración actualizada correctamente");

      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error en verifyPasswordAndSave:", err);
      setConfigError((err as Error).message);
      setShowPasswordModal(false);
    }
  };

  if (loading || configLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error en estadísticas: {error}</div>;
  }

  if (configError) {
    return <div className="flex items-center justify-center h-screen">Error en configuración: {configError}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      {/* Modal de contraseña */}
      <PasswordModal 
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError(null);
        }}
        onConfirm={verifyPasswordAndSave}
        error={passwordError}
      />

      {/* Gráfico de estadísticas */}
      {heroStats && goldenBotStats && (
        <StatsChart />
      )}

      {/* Estadísticas */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Estadísticas Generales</h2>

        {/* Estadísticas de Hero */}
        {heroStats && (
          <StatsDisplay 
            title="Hero"
            stats={heroStats}
          />
        )}

        {/* Estadísticas de GoldenBot */}
        {goldenBotStats && (
          <StatsDisplay 
            title="GoldenBot"
            stats={goldenBotStats}
          />
        )}
      </div>

      {/* Configuración del sitio */}
      {config && (
        <ConfigForm 
          config={config}
          onConfigChange={handleConfigChange}
          onSave={saveConfig}
          onAddNumber={addNumber}
          onRemoveNumber={removeNumber}
          successMessage={successMessage}
        />
      )}
    </div>
  );
}