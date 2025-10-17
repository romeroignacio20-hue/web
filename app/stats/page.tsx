'use client';

import { useEffect, useState } from "react";

interface Stats {
  clickCount: number;
  uniqueUsers: number;
  currentNumber: string;
}

interface WhatsAppConfig {
  whatsappNumbers: string[];
}

interface Platform {
  href: string;
  logoSrc: string;
  logoAlt: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Estados para edición
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({ whatsappNumbers: [] });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Función para cargar configuración actual
  const loadConfiguration = async () => {
    // Valores por defecto
    const defaultWhatsappConfig = {
      whatsappNumbers: [
        "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
        "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
      ]
    };
    
    const defaultPlatforms = [
      { href: "https://argenbet.net", logoSrc: "/logoArgenbet.png", logoAlt: "Logo Argenbet" },
      { href: "https://Ganamos.io", logoSrc: "/logoGanamos.png", logoAlt: "Logo Ganamos" },
      { href: "https://Apostamos.vip", logoSrc: "/logoApostamos.png", logoAlt: "Logo Apostamos" }
    ];

    try {
      // Cargar números de WhatsApp
      try {
        const whatsappResponse = await fetch("/api/config-redis", {
          method: "GET",
        });
        
        if (whatsappResponse.ok) {
          const whatsappData = await whatsappResponse.json();
          if (whatsappData && whatsappData.whatsappNumbers && whatsappData.whatsappNumbers.length > 0) {
            setWhatsappConfig(whatsappData);
            console.log("✅ Números de WhatsApp cargados desde Redis");
          } else {
            setWhatsappConfig(defaultWhatsappConfig);
            console.log("⚠️ Usando números de WhatsApp por defecto");
          }
        } else {
          setWhatsappConfig(defaultWhatsappConfig);
          console.log("⚠️ API config-redis no disponible, usando valores por defecto");
        }
      } catch (whatsappError) {
        console.error("❌ Error al cargar números de WhatsApp:", whatsappError);
        setWhatsappConfig(defaultWhatsappConfig);
      }

      // Cargar plataformas
      try {
        const platformsResponse = await fetch("/api/config", {
          method: "GET",
        });
        
        if (platformsResponse.ok) {
          const configData = await platformsResponse.json();
          if (configData && configData.platforms && configData.platforms.length > 0) {
            setPlatforms(configData.platforms);
            console.log("✅ Plataformas cargadas desde config");
          } else {
            setPlatforms(defaultPlatforms);
            console.log("⚠️ Usando plataformas por defecto");
          }
        } else {
          setPlatforms(defaultPlatforms);
          console.log("⚠️ API config no disponible, usando plataformas por defecto");
        }
      } catch (platformsError) {
        console.error("❌ Error al cargar plataformas:", platformsError);
        setPlatforms(defaultPlatforms);
      }
      
    } catch (error) {
      console.error("❌ Error general al cargar configuración:", error);
      // Usar valores por defecto en caso de error general
      setWhatsappConfig(defaultWhatsappConfig);
      setPlatforms(defaultPlatforms);
    }
  };

  // Función para inicializar completamente Redis con valores por defecto
  const initializeRedisData = async () => {
    console.log("Inicializando estructura completa de Redis...");
    
    try {
      // 1. Inicializar números de WhatsApp en Redis
      await fetch("/api/config-redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsappNumbers: [
            "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
            "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
          ]
        }),
      });
      console.log("✅ Números de WhatsApp inicializados");

      // 2. Crear entrada inicial de estadísticas (esto creará stats-Grupo Jugando)
      await fetch("/api/clicks-redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "system-init-" + Date.now(),
          business: "Grupo Jugando",
          timestamp: Date.now()
        }),
      });
      console.log("✅ Estadísticas iniciales creadas");

      // 3. Inicializar configuración adicional si es necesario
      await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          whatsappNumbers: [
            "https://api.whatsapp.com/send/?phone=5491173651087&text=Hola!+Quiero+un+usuario+porfavor!",
            "https://api.whatsapp.com/send/?phone=5492915279266&text=Hola!+Quiero+un+usuario+porfavor!"
          ]
        }),
      });
      console.log("✅ Configuración de respaldo creada");

      console.log("🎉 Redis completamente inicializado con valores por defecto");
      
    } catch (error) {
      console.error("❌ Error durante la inicialización de Redis:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Intentar obtener estadísticas existentes
        const response = await fetch("/api/clicks-redis?business=Grupo Jugando", {
          method: "GET",
        });

        let data;
        let statsData = {
          clickCount: 0,
          uniqueUsers: 0,
          currentNumber: "No disponible"
        };

        if (response.ok) {
          data = await response.json();
          
          // Si tenemos datos, procesarlos
          if (data) {
            // Calcular estadísticas reales
            const clicks = data.clicks || [];
            const uniqueUserIds = new Set();
            
            clicks.forEach((click: { userId?: string }) => {
              if (click.userId) {
                uniqueUserIds.add(click.userId);
              }
            });

            statsData = {
              clickCount: clicks.length,
              uniqueUsers: uniqueUserIds.size,
              currentNumber: data.currentNumber || "No disponible"
            };
          }
        } else {
          // Si no hay datos, crear estructura completa en Redis
          console.log("No se encontraron datos, inicializando Redis con valores por defecto...");
          
          try {
            // Crear múltiples entradas para inicializar completamente Redis
            await initializeRedisData();
            
            // Después de inicializar, obtener los datos creados
            const retryResponse = await fetch("/api/clicks-redis?business=Grupo Jugando", {
              method: "GET",
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              statsData = {
                clickCount: 0, // Empezar en 0
                uniqueUsers: 0, // Empezar en 0
                currentNumber: retryData.currentNumber || "Sistema inicializado"
              };
              console.log("Redis inicializado exitosamente con valores por defecto");
            } else {
              // Fallback si aún no funciona
              statsData = {
                clickCount: 0,
                uniqueUsers: 0,
                currentNumber: "Sistema inicializando..."
              };
            }
          } catch (createError) {
            console.error("Error al inicializar Redis:", createError);
            // Usar valores por defecto si falla la creación
            statsData = {
              clickCount: 0,
              uniqueUsers: 0,
              currentNumber: "Configurando..."
            };
          }
        }

        setStats(statsData);
        setError(null); // Limpiar cualquier error previo
        
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        
        // En caso de error, crear estadísticas por defecto
        setStats({
          clickCount: 0,
          uniqueUsers: 0,
          currentNumber: "Sistema inicializando..."
        });
        
        // No mostrar error al usuario, solo en consola
        console.log("Usando estadísticas por defecto debido a error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    loadConfiguration();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reutilizar la misma lógica de fetchStats pero sin el loading principal
      const response = await fetch("/api/clicks-redis?business=Grupo Jugando", {
        method: "GET",
      });

      let statsData = {
        clickCount: 0,
        uniqueUsers: 0,
        currentNumber: "No disponible"
      };

      if (response.ok) {
        const data = await response.json();
        
        if (data) {
          const clicks = data.clicks || [];
          const uniqueUserIds = new Set();
          
          clicks.forEach((click: { userId?: string }) => {
            if (click.userId) {
              uniqueUserIds.add(click.userId);
            }
          });

          statsData = {
            clickCount: clicks.length,
            uniqueUsers: uniqueUserIds.size,
            currentNumber: data.currentNumber || "No disponible"
          };
        }
      } else {
        // Si no hay datos durante el refresh, también inicializar Redis
        console.log("Datos no encontrados durante refresh, reinicializando...");
        await initializeRedisData();
        
        // Intentar obtener datos después de inicializar
        const retryResponse = await fetch("/api/clicks-redis?business=Grupo Jugando", {
          method: "GET",
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          statsData = {
            clickCount: 0,
            uniqueUsers: 0,
            currentNumber: retryData.currentNumber || "Sistema reinicializado"
          };
        }
      }

      setStats(statsData);
      setError(null);
    } catch (error) {
      console.error("Error al refrescar estadísticas:", error);
      setError("Error al refrescar las estadísticas");
    } finally {
      setRefreshing(false);
    }
  };

  // Funciones para manejar la edición
  const handleWhatsAppNumberChange = (index: number, value: string) => {
    const newNumbers = [...whatsappConfig.whatsappNumbers];
    newNumbers[index] = value;
    setWhatsappConfig({ whatsappNumbers: newNumbers });
  };

  const addWhatsAppNumber = () => {
    const newNumbers = [...whatsappConfig.whatsappNumbers, ''];
    setWhatsappConfig({ whatsappNumbers: newNumbers });
  };

  const removeWhatsAppNumber = (index: number) => {
    const newNumbers = whatsappConfig.whatsappNumbers.filter((_, i) => i !== index);
    setWhatsappConfig({ whatsappNumbers: newNumbers });
  };

  const handlePlatformChange = (index: number, field: keyof Platform, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    setPlatforms(newPlatforms);
  };

  const addPlatform = () => {
    const newPlatform = { href: '', logoSrc: '', logoAlt: '' };
    setPlatforms([...platforms, newPlatform]);
  };

  const removePlatform = (index: number) => {
    const newPlatforms = platforms.filter((_, i) => i !== index);
    setPlatforms(newPlatforms);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    let whatsappSaved = false;
    let platformsSaved = false;
    
    // Validar números de WhatsApp antes de enviar
    const validWhatsappNumbers = whatsappConfig.whatsappNumbers.filter(num => 
      num && typeof num === 'string' && num.trim().length > 0
    );
    
    if (validWhatsappNumbers.length === 0) {
      setError("❌ Debe haber al menos un número de WhatsApp válido");
      setSaving(false);
      return;
    }
    
    try {
      // Guardar números de WhatsApp
      try {
        const whatsappResponse = await fetch("/api/config-redis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ whatsappNumbers: validWhatsappNumbers }),
        });
        
        if (whatsappResponse.ok) {
          whatsappSaved = true;
          console.log("✅ Números de WhatsApp guardados exitosamente");
        } else {
          const errorData = await whatsappResponse.json();
          console.error("❌ Error al guardar números de WhatsApp:", errorData);
          setError(`Error en WhatsApp: ${errorData.error || 'Error desconocido'}`);
        }
      } catch (whatsappError) {
        console.error("❌ Error de conexión al guardar números de WhatsApp:", whatsappError);
      }

      // Guardar plataformas
      try {
        const platformsResponse = await fetch("/api/config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ platforms }),
        });
        
        if (platformsResponse.ok) {
          platformsSaved = true;
          console.log("✅ Plataformas guardadas exitosamente");
        } else {
          const errorData = await platformsResponse.json();
          console.error("❌ Error al guardar plataformas:", errorData);
          setError(`Error en Plataformas: ${errorData.error || 'Error desconocido'}`);
        }
      } catch (platformsError) {
        console.error("❌ Error de conexión al guardar plataformas:", platformsError);
      }

      // Mostrar resultado basado en qué se guardó exitosamente
      if (whatsappSaved && platformsSaved) {
        setSuccessMessage("✅ Configuración completa guardada exitosamente");
        setEditMode(false);
      } else if (whatsappSaved || platformsSaved) {
        setSuccessMessage(`⚠️ Guardado parcial: ${whatsappSaved ? 'WhatsApp ✅' : 'WhatsApp ❌'} | ${platformsSaved ? 'Plataformas ✅' : 'Plataformas ❌'}`);
      } else {
        setError("❌ No se pudo guardar ninguna configuración. Verifique la conexión.");
      }
      
      // Limpiar mensajes después de 5 segundos
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      
    } catch (error) {
      console.error("❌ Error general al guardar configuración:", error);
      setError("Error inesperado al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Estadísticas - Grupo Jugando</h1>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Estadísticas - Grupo Jugando</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              editMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {editMode ? 'Cancelar Edición' : 'Editar Configuración'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              refreshing 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {refreshing ? 'Actualizando...' : 'Refrescar'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
          <p>{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total de Clicks</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.clickCount}</p>
            <p className="text-xs text-gray-500 mt-1">Clicks registrados en el sistema</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Usuarios Únicos</h3>
            <p className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Usuarios diferentes que hicieron click</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Número Actual</h3>
            <p className="text-sm text-gray-600 break-all">{stats.currentNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Número de WhatsApp activo</p>
          </div>
        </div>
      )}

      {/* Información de Configuración Actual */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">📋 Configuración Actual del Sistema</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Números de WhatsApp Configurados */}
          <div>
            <h4 className="text-md font-medium mb-3 text-blue-600">📱 Números de WhatsApp</h4>
            <div className="space-y-2">
              {whatsappConfig.whatsappNumbers.length > 0 ? (
                whatsappConfig.whatsappNumbers.map((number, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Número {index + 1}</p>
                        <p className="text-sm font-mono break-all">{number}</p>
                      </div>
                      {stats?.currentNumber === number && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Activo
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay números configurados</p>
              )}
            </div>
          </div>

          {/* Links de Plataformas */}
          <div>
            <h4 className="text-md font-medium mb-3 text-purple-600">🌐 Plataformas Configuradas</h4>
            <div className="space-y-2">
              {platforms.length > 0 ? (
                platforms.map((platform, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 mb-1">Plataforma {index + 1}</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">URL:</span> 
                        <a 
                          href={platform.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:underline break-all"
                        >
                          {platform.href}
                        </a>
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Logo:</span> {platform.logoSrc}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Alt:</span> {platform.logoAlt}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay plataformas configuradas</p>
              )}
            </div>
          </div>
        </div>

        {/* Información Adicional del Sistema */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium mb-3 text-green-600">⚙️ Información del Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-800">Total de Números</p>
              <p className="text-lg font-bold text-blue-600">{whatsappConfig.whatsappNumbers.length}</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm font-medium text-purple-800">Total de Plataformas</p>
              <p className="text-lg font-bold text-purple-600">{platforms.length}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-md">
              <p className="text-sm font-medium text-green-800">Estado del Sistema</p>
              <p className="text-sm font-bold text-green-600">
                {whatsappConfig.whatsappNumbers.length > 0 && platforms.length > 0 
                  ? '✅ Configurado' 
                  : '⚠️ Configuración Incompleta'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Rotación de Números */}
        {whatsappConfig.whatsappNumbers.length > 1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h5 className="text-sm font-medium text-yellow-800 mb-1">🔄 Rotación Automática</h5>
            <p className="text-xs text-yellow-700">
              El sistema rota automáticamente entre {whatsappConfig.whatsappNumbers.length} números de WhatsApp. 
              Número actual: <span className="font-mono">{stats?.currentNumber || 'No disponible'}</span>
            </p>
          </div>
        )}

        {/* Estado de Redis y Base de Datos */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium mb-3 text-orange-600">🗄️ Estado de la Base de Datos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded-md">
              <p className="text-sm font-medium text-orange-800">Clicks Registrados</p>
              <p className="text-lg font-bold text-orange-600">{stats?.clickCount || 0}</p>
              <p className="text-xs text-orange-700">Total de interacciones guardadas</p>
            </div>
            
            <div className="bg-teal-50 p-3 rounded-md">
              <p className="text-sm font-medium text-teal-800">Usuarios Únicos</p>
              <p className="text-lg font-bold text-teal-600">{stats?.uniqueUsers || 0}</p>
              <p className="text-xs text-teal-700">Usuarios diferentes identificados</p>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <h5 className="text-sm font-medium text-gray-800 mb-2">📊 Claves de Redis Utilizadas</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="font-mono bg-white p-2 rounded border">
                <span className="text-blue-600">whatsapp-numbers</span>
                <span className="text-gray-500 ml-2">→ Números configurados</span>
              </div>
              <div className="font-mono bg-white p-2 rounded border">
                <span className="text-purple-600">stats-Grupo Jugando</span>
                <span className="text-gray-500 ml-2">→ Estadísticas generales</span>
              </div>
              <div className="font-mono bg-white p-2 rounded border">
                <span className="text-green-600">clicks-Grupo Jugando</span>
                <span className="text-gray-500 ml-2">→ Lista de clicks</span>
              </div>
              <div className="font-mono bg-white p-2 rounded border">
                <span className="text-orange-600">data.json</span>
                <span className="text-gray-500 ml-2">→ Configuración de respaldo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones de Edición */}
      {editMode && (
        <div className="mt-6 space-y-6">
          {/* Edición de Números de WhatsApp */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Números de WhatsApp</h3>
              <button
                onClick={addWhatsAppNumber}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                + Agregar Número
              </button>
            </div>
            
            <div className="space-y-3">
              {whatsappConfig.whatsappNumbers.map((number, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número {index + 1}
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => handleWhatsAppNumberChange(index, e.target.value)}
                      placeholder="https://api.whatsapp.com/send/?phone=..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {whatsappConfig.whatsappNumbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWhatsAppNumber(index)}
                      className="mt-6 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Edición de Plataformas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Links de Plataformas</h3>
              <button
                onClick={addPlatform}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                + Agregar Plataforma
              </button>
            </div>
            
            <div className="space-y-4">
              {platforms.map((platform, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium">Plataforma {index + 1}</h4>
                    {platforms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlatform(index)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de la Plataforma
                      </label>
                      <input
                        type="text"
                        value={platform.href}
                        onChange={(e) => handlePlatformChange(index, 'href', e.target.value)}
                        placeholder="https://ejemplo.com"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ruta del Logo
                      </label>
                      <input
                        type="text"
                        value={platform.logoSrc}
                        onChange={(e) => handlePlatformChange(index, 'logoSrc', e.target.value)}
                        placeholder="/logo.png"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texto Alternativo
                      </label>
                      <input
                        type="text"
                        value={platform.logoAlt}
                        onChange={(e) => handlePlatformChange(index, 'logoAlt', e.target.value)}
                        placeholder="Logo de la plataforma"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end">
            <button
              onClick={saveConfiguration}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                saving 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Información del Sistema</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>🔧 Auto-inicialización:</strong> Esta página crea automáticamente toda la estructura de datos en Redis si no existe.
          </p>
          <p>
            <strong>📊 Datos creados:</strong> Números de WhatsApp, estadísticas de clicks, usuarios únicos y configuración del sistema.
          </p>
          <p>
            <strong>🔄 Valores por defecto:</strong> Todos los contadores empiezan en 0, números de WhatsApp con valores predeterminados.
          </p>
          <p>
            <strong>📈 Actualización:</strong> Las estadísticas se actualizan en tiempo real con cada interacción de los usuarios.
          </p>
        </div>
      </div>
    </div>
  );
}