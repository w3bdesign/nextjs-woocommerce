import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Truck, RotateCcw, Settings, Shield } from 'lucide-react';

/**
 * Product information section with reviews and benefits
 * Displays below the main configurator
 */
export default function ProductInfo() {
  return (
    <div className="mt-8 space-y-8">
      {/* Reviews Section */}
      <Card className="rounded-xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">4.9/5</span>
              </div>
              <p className="text-sm text-gray-600">
                Rating based on 9,368 reviews collected on mebl.com
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Delivery Included */}
        <Card className="rounded-xl shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delivery Included
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              To every place in Europe
            </p>
            <Button variant="link" className="text-xs p-0 h-auto">
              Read more
            </Button>
          </CardContent>
        </Card>

        {/* 100 Days Free Returns */}
        <Card className="rounded-xl shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              100 Days Free Returns
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Or return within 100 days
            </p>
            <Button variant="link" className="text-xs p-0 h-auto">
              Read more
            </Button>
          </CardContent>
        </Card>

        {/* Assembly Service */}
        <Card className="rounded-xl shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Assembly Service
            </h3>
            <p className="text-sm text-gray-600 mb-3">Available in Poland</p>
            <Button variant="link" className="text-xs p-0 h-auto">
              Read more
            </Button>
          </CardContent>
        </Card>

        {/* 10 Year Warranty */}
        <Card className="rounded-xl shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              10 Year Warranty
            </h3>
            <p className="text-sm text-gray-600 mb-3">Designed for years</p>
            <Button variant="link" className="text-xs p-0 h-auto">
              Read more
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
