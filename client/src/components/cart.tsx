import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { toast } = useToast();
  
  const { data: cartItems, isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
  });

  if (isLoadingCart) {
    return (
      <SheetContent>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SheetContent>
    );
  }

  const cartItemsWithProducts = cartItems?.map((item) => ({
    ...item,
    product: products?.find((p) => p.id === item.productId),
  }));

  const total = cartItemsWithProducts?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
      </SheetHeader>

      <div className="mt-8 space-y-4">
        {cartItemsWithProducts?.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <img
              src={item.product?.image}
              alt={item.product?.name}
              className="h-16 w-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium">{item.product?.name}</h4>
              <p className="text-sm text-muted-foreground">
                ${((item.product?.price || 0) / 100).toFixed(2)} × {item.quantity}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFromCartMutation.mutate(item.id)}
              disabled={removeFromCartMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {cartItemsWithProducts?.length === 0 && (
          <p className="text-center text-muted-foreground">Your cart is empty</p>
        )}

        {cartItemsWithProducts?.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${(total! / 100).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
}
