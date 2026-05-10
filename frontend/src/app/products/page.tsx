import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";

const products = [
  { id: 1, name: "생딸기 생크림 케이크", category: "홀케이크", price: 45000, status: "판매 중", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop" },
  { id: 2, name: "초코 가나슈 케이크", category: "홀케이크", price: 38000, status: "판매 중", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop" },
  { id: 3, name: "망고 요거트 케이크", category: "시즌 한정", price: 42000, status: "품절", image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop" },
  { id: 4, name: "바스크 치즈 케이크", category: "디저트", price: 28000, status: "판매 중", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop" },
];

export default function ProductsPage() {
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <div className="aspect-square w-full overflow-hidden bg-zinc-100">
              <img
                src={product.image}
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
                  product.status === "판매 중" ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 gap-1 text-xs" size="sm">
                  <Edit2 size={14} />
                  수정
                </Button>
                <Button variant="outline" className="flex-1 gap-1 text-xs text-red-500 hover:text-red-600" size="sm">
                  <Trash2 size={14} />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
