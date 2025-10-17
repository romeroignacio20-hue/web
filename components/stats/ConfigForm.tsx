'use client';

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

interface ConfigFormProps {
  config: SiteConfigType;
  onConfigChange: (section: string, field: string, value: string | string[]) => void;
  onSave: () => void;
  onAddNumber: (businessType: 'principalGolden' | 'descartableHero') => void;
  onRemoveNumber: (businessType: 'principalGolden' | 'descartableHero', index: number) => void;
  successMessage: string | null;
}

export default function ConfigForm({ config, onConfigChange, onSave, onAddNumber, onRemoveNumber, successMessage }: ConfigFormProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Configuración del Sitio</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Información General</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Sitio
            </label>
            <input
              type="text"
              value={config.name || ""}
              onChange={(e) => onConfigChange('root', 'name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={config.description || ""}
              onChange={(e) => onConfigChange('root', 'description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción Plataforma
            </label>
            <input
              type="text"
              value={config.descriptionPlataform || ""}
              onChange={(e) => onConfigChange('root', 'descriptionPlataform', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Números de WhatsApp - GoldenBot */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Números de WhatsApp - GoldenBot</h3>
            <button
              type="button"
              onClick={() => onAddNumber('principalGolden')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              + Agregar Número
            </button>
          </div>
          
          <div className="space-y-3">
            {config.whatsappNumbers?.principalGolden?.map((number, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número {index + 1}
                  </label>
                  <input
                    type="text"
                    value={number || ""}
                    onChange={(e) => onConfigChange('whatsappNumbers.principalGolden', index.toString(), e.target.value)}
                    placeholder="https://wa.me/54911..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {config.whatsappNumbers.principalGolden.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveNumber('principalGolden', index)}
                    className="mt-6 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Números de WhatsApp - Hero */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Números de WhatsApp - Hero</h3>
            <button
              type="button"
              onClick={() => onAddNumber('descartableHero')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              + Agregar Número
            </button>
          </div>
          
          <div className="space-y-3">
            {config.whatsappNumbers?.descartableHero?.map((number, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número {index + 1}
                  </label>
                  <input
                    type="text"
                    value={number || ""}
                    onChange={(e) => onConfigChange('whatsappNumbers.descartableHero', index.toString(), e.target.value)}
                    placeholder="https://wa.me/54911..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {config.whatsappNumbers.descartableHero.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveNumber('descartableHero', index)}
                    className="mt-6 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
