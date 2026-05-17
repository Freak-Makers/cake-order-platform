"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import { getProducts, deleteProduct } from "@/api/product.api";
import { Product } from "@/api/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">상품 관리</h1>
          <p className="text-zinc-500">매장에서 판매 중인 상품 목록입니다.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          새 상품 등록
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div>
                  <p className="text-xs font-medium text-pink-500 uppercase tracking-wider">{product.category}</p>
                  <CardTitle className="mt-1 text-base">{product.name}</CardTitle>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600">
                  <MoreVertical size={18} />
                </button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-zinc-900">{product.price.toLocaleString()}원</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.status === "AVAILABLE" ? "bg-green-50 text-green-600" :
                    product.status === "SOLD_OUT" ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {product.status === "AVAILABLE" ? "판매 중" : 
                     product.status === "SOLD_OUT" ? "품절" : "숨김"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1 text-xs" size="sm">
                    <Edit2 size={14} />
                    수정
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-1 text-xs text-red-500 hover:text-red-600" 
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 size={14} />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-500 bg-white rounded-xl border border-dashed border-zinc-200">
              등록된 상품이 없습니다.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
