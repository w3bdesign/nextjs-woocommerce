import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { STYLE_OPTIONS } from './constants';

export default function StyleSelector() {
  const [selectedStyle, setSelectedStyle] = useState<string>(
    STYLE_OPTIONS[0].id,
  );

  return (
    <Card className="m-0 rounded-none border-0 border-b">
      <CardContent className="p-6">
        <CardTitle className="text-sm font-semibold text-gray-900 mb-4">
          Style
        </CardTitle>
        <div className="grid grid-cols-5 gap-2">
          {STYLE_OPTIONS.map((style) => (
            <Button
              key={style.id}
              variant={selectedStyle === style.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 h-auto ${
                selectedStyle === style.id
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="text-xs font-medium">{style.label}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
