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

  const product = await prisma.sanPham.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Hình ảnh */}
        <div>
          <Image
            src={product.hinhAnh || '/images/placeholder-pc.jpg'}
            alt={product.tenSanPham}
            width={650}
            height={650}
            className="rounded-3xl shadow-2xl object-contain bg-white p-6"
            priority
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">{product.tenSanPham}</h1>
            <p className="text-3xl font-semibold text-red-600 mt-3">
              {product.gia.toLocaleString('vi-VN')} ₫
            </p>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium transition">
              Thêm vào giỏ hàng
            </button>
            <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-medium transition">
              Thêm vào Build PC
            </button>
          </div>

          <div className="prose">
            <h3 className="text-xl font-semibold">Mô tả</h3>
            <p>{product.moTa || 'Đang cập nhật mô tả sản phẩm...'}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
            <pre className="bg-gray-100 p-6 rounded-2xl text-sm overflow-auto">
              {JSON.stringify(product.thongSoKyThuat, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}