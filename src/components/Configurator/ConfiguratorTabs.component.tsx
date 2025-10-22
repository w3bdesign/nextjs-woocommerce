import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Sliders, ChevronDown } from 'lucide-react';
import type { EnhancedControlsProps } from './types';
import PricingSection from './PricingSection.component';
import StyleSelector from './StyleSelector.component';
import DimensionSlider from './DimensionSlider.component';
import ColorPalette from './ColorPalette.component';

/**
 * Compact configurator with two tabs and collapsible sections
 * Design tab (Style) + Adjustments tab (Dimensions + Colors)
 * Fixed height with styled scrollbars
 */
export default function ConfiguratorTabs({
  modelConfig,
  product,
}: EnhancedControlsProps) {
  const [activeTab, setActiveTab] = useState('adjustments');
  const [expandedSections, setExpandedSections] = useState({
    style: false,
    dimensions: true,
    colors: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    {
      id: 'adjustments',
      label: 'Adjustments',
      icon: Sliders,
    },
    {
      id: 'design',
      label: 'Design',
      icon: Palette,
    },
  ];

  return (
    <aside
      className="w-full xl:w-96 bg-white border-t xl:border-t-0 xl:border-l border-gray-200 flex flex-col overflow-hidden"
      style={{ maxHeight: '700px' }}
    >
      {/* Pricing Section - Compact */}
      <PricingSection product={product} />

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent h-auto p-0 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 p-3 rounded-none data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=inactive]:text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content - Fixed height with stable scrollbar (no layout shift) */}
        <div
          className="flex-1 overflow-y-auto min-h-0 scrollbar-thin"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* Design Tab */}
          <TabsContent value="design" className="m-0">
            {/* Style Section - Collapsible */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('style')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  Design Style
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    expandedSections.style ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSections.style && (
                <div className="px-4 pb-4 bg-gray-50">
                  <StyleSelector />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Adjustments Tab */}
          <TabsContent value="adjustments" className="m-0">
            {/* Dimensions Section - Collapsible */}
            {modelConfig?.dimensions && (
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('dimensions')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-900">
                    Size & Proportions
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      expandedSections.dimensions ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedSections.dimensions && (
                  <div className="px-4 pb-4 bg-gray-50 space-y-4">
                    <DimensionSlider
                      type="width"
                      modelConfig={modelConfig}
                      label="Width"
                    />
                    <DimensionSlider
                      type="height"
                      modelConfig={modelConfig}
                      label="Height"
                    />
                    <DimensionSlider
                      type="depth"
                      modelConfig={modelConfig}
                      label="Depth"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Colors Section - Collapsible */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  Materials & Finishes
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    expandedSections.colors ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSections.colors && (
                <div className="px-4 pb-4 bg-gray-50">
                  <ColorPalette />
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Action Button - Only Add to Cart, Save button is floating */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 h-auto rounded-lg">
          Add to Cart
        </Button>
      </div>
    </aside>
  );
}
