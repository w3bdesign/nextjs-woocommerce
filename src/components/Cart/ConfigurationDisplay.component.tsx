import { Badge } from '@/components/ui/badge';
import React from 'react';

interface ConfigurationDisplayProps {
  extraData?: Array<{ key: string; value: string }>;
}

/**
 * Displays 3D configurator state from cart item extraData
 * Shows colors, dimensions, and interactive states in a user-friendly format
 */
export const ConfigurationDisplay: React.FC<ConfigurationDisplayProps> = ({
  extraData,
}) => {
  if (!extraData || extraData.length === 0) return null;

  // Find individual configuration keys
  const itemsEntry = extraData.find((item) => item.key === 'items');
  const dimensionsEntry = extraData.find((item) => item.key === 'dimensions');
  const modelIdEntry = extraData.find((item) => item.key === 'modelId');

  // Check if we have any configuration data
  if (!itemsEntry && !dimensionsEntry && !modelIdEntry) return null;

  try {
    // Parse the data
    const items = itemsEntry ? JSON.parse(itemsEntry.value) : {};
    const dimensions = dimensionsEntry ? JSON.parse(dimensionsEntry.value) : {};

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
        <div className="font-semibold text-gray-700 mb-2">
          🎨 Custom Configuration
        </div>

        {/* Colors */}
        {Object.keys(items).length > 0 && (
          <div className="mb-1">
            <span className="text-gray-600">Colors:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(items).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dimensions */}
        {Object.keys(dimensions).length > 0 && (
          <div className="mb-1">
            <span className="text-gray-600">Dimensions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(dimensions).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to parse configuration data:', error);
    return (
      <div className="mt-2 text-xs text-red-600">
        ⚠️ Configuration data could not be loaded
      </div>
    );
  }
};
