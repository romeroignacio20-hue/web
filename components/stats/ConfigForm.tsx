'use client';

interface WhatsAppConfig {
  whatsappNumbers: string[];
}

interface ConfigFormProps {
  config: WhatsAppConfig;
  onConfigChange: (numbers: string[]) => void;
  onSave: () => void;
  successMessage: string | null;
}

export default function ConfigForm({ config, onConfigChange, onSave, successMessage }: ConfigFormProps) {
  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...config.whatsappNumbers];
    newNumbers[index] = value;
    onConfigChange(newNumbers);
  };

  const addNumber = () => {
    const newNumbers = [...config.whatsappNumbers, ''];
    onConfigChange(newNumbers);
  };

  const removeNumber = (index: number) => {
    const newNumbers = config.whatsappNumbers.filter((_, i) => i !== index);
    onConfigChange(newNumbers);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Configuración de WhatsApp</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Números de WhatsApp</h3>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium">Números de Grupo Jugando</h4>
            <button
              type="button"
              onClick={addNumber}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              + Agregar Número
            </button>
          </div>
          
          <div className="space-y-3">
            {config.whatsappNumbers.map((number: string, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número {index + 1}
                  </label>
                  <input
                    type="text"
                    value={number || ""}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    placeholder="https://wa.me/54911..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {config.whatsappNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNumber(index)}
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
