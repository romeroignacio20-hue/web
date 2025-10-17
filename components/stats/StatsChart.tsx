'use client';

import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";



interface ClickEvent {
  userId: string;
  timestamp: number;
  business?: "Hero" | "GoldenBot";
}

export default function StatsChart() {
  // Fetch de clicks de todos los negocios al montar el componente
  useEffect(() => {
    async function fetchAllClicks() {
      const negocios = ['Hero', 'GoldenBot', 'Fichas Ya'];
      let allClicks: ClickEvent[] = [];
      for (const negocio of negocios) {
        try {
          const res = await fetch(`/api/clicks-redis?business=${encodeURIComponent(negocio)}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.clicks)) {
              // Asegurarse de que cada click tenga el campo 'business'
              const withBusiness = data.clicks.map((c: ClickEvent) => ({ ...c, business: negocio }));
              allClicks = allClicks.concat(withBusiness);
            }
          }
        } catch {}
      }
      setClicks(allClicks);
      console.log('[StatsChart] Clicks recibidos:', allClicks);

    }
    fetchAllClicks();
  }, []);

  const [activeChart, setActiveChart] = useState<'hero' | 'goldenBot'>('hero');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');
  const [filteredChartData, setFilteredChartData] = useState<Array<{date: string, hero: number, goldenBot: number, heroUsers?: number, goldenBotUsers?: number}>>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'clicks' | 'users'>('clicks');

  // Configuración del gráfico para clics
  const clicksChartConfig: ChartConfig = {
    views: {
      label: "Clics",
    },
    hero: {
      label: "Hero",
      color: "hsl(215, 100%, 50%)", // Azul
    },
    goldenBot: {
      label: "GoldenBot",
      color: "hsl(45, 100%, 50%)", // Dorado
    },
  };

  // Configuración del gráfico para usuarios
  const usersChartConfig: ChartConfig = {
    views: {
      label: "Usuarios",
    },
    hero: {
      label: "Hero",
      color: "hsl(215, 100%, 50%)", // Azul
    },
    goldenBot: {
      label: "GoldenBot",
      color: "hsl(45, 100%, 50%)", // Dorado
    },
  };

  // Procesar los clicks individuales para generar las estadísticas
  const filterChartData = useCallback((period: 'day' | 'week' | 'month') => {
    // Log para depuración
    console.log('[StatsChart] Filtrando datos para periodo:', period, 'Clicks:', clicks);

    if (!clicks.length) return;
    let filtered: { date: string; hero: number; goldenBot: number; heroUsers?: number; goldenBotUsers?: number }[] = [];
    const now = new Date();

    if (period === 'day') {
      // Día actual: 24 horas
      const horas = Array.from({ length: 24 }, (_, i) => ({
        date: `${i}:00`,
        hero: 0,
        goldenBot: 0,
        heroUsers: 0,
        goldenBotUsers: 0
      }));
      clicks.forEach((click: ClickEvent) => {
        const fecha = new Date(click.timestamp);
        if (
          fecha.getFullYear() === now.getFullYear() &&
          fecha.getMonth() === now.getMonth() &&
          fecha.getDate() === now.getDate()
        ) {
          const hora = fecha.getHours();
          if (click.business === 'GoldenBot') {
            horas[hora].goldenBot += 1;
          } else if (click.business === 'Hero') {
            horas[hora].hero += 1;
          }
          // Si quieres ignorar Fichas Ya, no hagas nada
        }
      });
      filtered = horas;
    } else if (period === 'week') {
      // Últimos 7 días
      const diasArray: string[] = [];
      const dataPorDia: Record<string, { hero: number; goldenBot: number; heroUsers: number; goldenBotUsers: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
        // Usar fecha local YYYY-MM-DD
        const key = fecha.getFullYear() + '-' + String(fecha.getMonth()+1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
        diasArray.push(key);
        dataPorDia[key] = { hero: 0, goldenBot: 0, heroUsers: 0, goldenBotUsers: 0 };
      }
      // Agrupar clicks por fecha y bot
const usersPorDia: Record<string, { hero: Set<string>; goldenBot: Set<string> }> = {};
clicks.forEach(click => {
        const fecha = new Date(click.timestamp);
const key = fecha.getFullYear() + '-' + String(fecha.getMonth()+1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
// Determinar el bot (asume 'Hero' si no hay campo business)
const bot = (click.business === 'GoldenBot') ? 'goldenBot' : 'hero';
if (key in dataPorDia) {
  dataPorDia[key][bot] += 1;
  if (!usersPorDia[key]) usersPorDia[key] = { hero: new Set(), goldenBot: new Set() };
  usersPorDia[key][bot].add(click.userId.split('_')[0]);
}        }
      );
// Calcular usuarios únicos por día y bot

      filtered = diasArray.map(key => ({
        date: key,
        ...dataPorDia[key]
      }));
    } else if (period === 'month') {
      // Últimos 30 días
      const diasArray: string[] = [];
      const dataPorDia: Record<string, { hero: number; goldenBot: number; heroUsers: number; goldenBotUsers: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const fecha = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
        const key = fecha.getFullYear() + '-' + String(fecha.getMonth()+1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
        diasArray.push(key);
        dataPorDia[key] = { hero: 0, goldenBot: 0, heroUsers: 0, goldenBotUsers: 0 };
      }
      // Agrupar clicks por fecha y bot
const usersPorDia: Record<string, { hero: Set<string>; goldenBot: Set<string> }> = {};
clicks.forEach(click => {
        const fecha = new Date(click.timestamp);
const key = fecha.getFullYear() + '-' + String(fecha.getMonth()+1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
// Determinar el bot (asume 'Hero' si no hay campo business)
const bot = (click.business === 'GoldenBot') ? 'goldenBot' : 'hero';
if (key in dataPorDia) {
  dataPorDia[key][bot] += 1;
  if (!usersPorDia[key]) usersPorDia[key] = { hero: new Set(), goldenBot: new Set() };
  usersPorDia[key][bot].add(click.userId.split('_')[0]);
}        }
      );

      filtered = diasArray.map(key => ({
        date: key,
        ...dataPorDia[key]
      }));
    }
    setFilteredChartData(filtered);
  }, [clicks]);

  // Efecto para filtrar datos cuando cambia el período
  // Obtener los clicks individuales del backend
  useEffect(() => {
    fetch('/api/clicks-redis?business=Hero&limit=1000')
      .then(res => res.json())
      .then(data => {
        setClicks(data.clicks || []);
      });

  }, []);

  useEffect(() => {
    filterChartData(timeFilter);
  }, [timeFilter, filterChartData, clicks]);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Estadísticas de Bots</CardTitle>
          <CardDescription>
            Comparativa entre Hero y GoldenBot
          </CardDescription>
        </div>
        <div className="flex">
          {["hero", "goldenBot"].map((key) => {
            const chart = key as keyof typeof clicksChartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart as 'hero' | 'goldenBot')}
              >
                <span className="text-xs text-muted-foreground">
                  {clicksChartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {key === 'hero' 
                    ? activeTab === 'clicks'
                      ? clicks.length.toLocaleString()
                      : Array.from(new Set(clicks.map(c => c.userId))).length.toLocaleString()
                    : 0
                  }
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      {/* Pestañas para alternar entre clics y usuarios únicos */}
      <div className="px-6 pt-4 border-b bg-muted/20">
        <div className="flex justify-center mb-2">
          <h3 className="text-lg font-semibold">Tipo de estadística</h3>
        </div>
        
        <Tabs 
          defaultValue="clicks" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value as 'clicks' | 'users')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 h-13">
            <TabsTrigger value="clicks" className="text-base py-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Clics Totales
              </span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-base py-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Usuarios Únicos
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clicks">
            {/* Filtros de tiempo para clics */}
            <div className="pb-2">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setTimeFilter('day')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'day' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
            
            {/* Gráfico de clics */}
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={clicksChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={filteredChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short"
                      });

                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[180px]"
                        nameKey="views"
                        labelFormatter={(value: string) => {
                          const date = new Date(value);
                          return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
// Calcular usuarios únicos por día y bot

                        }}
                      />
                    }
                  />
                  <Bar dataKey="hero" fill={clicksChartConfig.hero.color} />
                  <Bar dataKey="goldenBot" fill={clicksChartConfig.goldenBot.color} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="users">
            {/* Filtros de tiempo para usuarios */}
            <div className="pb-2">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setTimeFilter('day')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'day' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'week' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    timeFilter === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
            
            {/* Gráfico de usuarios */}
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={usersChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={filteredChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short"
                      });

                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[180px]"
                        nameKey="views"
                        labelFormatter={(value: string) => {
                          const date = new Date(value);
                          return isNaN(date.getTime()) ? value : date.toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });

                        }}
                      />
                    }
                  />
                  <Bar dataKey="heroUsers" name="hero" fill={usersChartConfig.hero.color} />
                  <Bar dataKey="goldenBotUsers" name="goldenBot" fill={usersChartConfig.goldenBot.color} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
