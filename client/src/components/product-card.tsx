import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
  });

  return (
    <Card className="overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 w-full object-cover"
      />
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {product.description}
        </p>
        <p className="text-lg font-bold mt-2">${(product.price / 100).toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {user && (
          <Button
            className="w-full"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
