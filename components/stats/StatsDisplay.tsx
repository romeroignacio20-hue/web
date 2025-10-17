'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatsDisplayProps {
  title: string;
  stats: {
    clickCount: number;
    uniqueUsers: number;
    currentNumber: string;
  };
}

export default function StatsDisplay({ title, stats }: StatsDisplayProps) {
  return (
    <div className="p-4 bg-white shadow rounded-lg mb-4">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      
      <Tabs defaultValue="clicks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="clicks">Clics Totales</TabsTrigger>
          <TabsTrigger value="users">Usuarios Únicos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clicks" className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total de clics:</span>
            <span className="text-2xl font-bold">{stats.clickCount}</span>
          </div>
          <div className="mt-4">
            <p>
              <strong>Número actual:</strong>{" "}
              <a
                href={stats.currentNumber}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {stats.currentNumber}
              </a>
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Usuarios únicos:</span>
            <span className="text-2xl font-bold">{stats.uniqueUsers}</span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Visitantes únicos que han interactuado con el botón
            </p>
          </div>
          <div className="mt-4">
            <p>
              <strong>Tasa de conversión:</strong>{" "}
              <span className="font-semibold">
                {stats.clickCount > 0 
                  ? `${((stats.uniqueUsers / stats.clickCount) * 100).toFixed(1)}%` 
                  : "0%"}
              </span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
