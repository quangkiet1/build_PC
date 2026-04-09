// app/(main)/products/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id: id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Phần hình ảnh */}
        <div className="space-y-4">
          <Image
            src={product.image || '/images/placeholder-pc.jpg'}
            alt={product.name}
            width={650}
            height={650}
            className="rounded-3xl shadow-2xl object-contain bg-white p-4"
            priority
          />
        </div>

        {/* Phần thông tin */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-semibold text-red-600 mt-3">
              {product.price.toLocaleString('vi-VN')} ₫
            </p>
          </div>

          <div className="flex gap-4">
            {/* Nút thêm vào giỏ hàng (sẽ làm tiếp ở bước sau) */}
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-2xl transition">
              Thêm vào giỏ hàng
            </button>
            
            {/* Nút thêm vào Build PC */}
            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 rounded-2xl transition">
              Thêm vào Build PC
            </button>
          </div>

          <div className="prose">
            <h3 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'Đang cập nhật mô tả chi tiết...'}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
            <pre className="bg-gray-100 p-6 rounded-2xl text-sm overflow-auto border">
              {JSON.stringify(product.thongSoKyThuat, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}