import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ShoppingCart } from "lucide-react";
import { Sheet, SheetTrigger } from "./ui/sheet";
import Cart from "./cart";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="text-2xl font-bold tracking-tight px-0"
          onClick={() => setLocation("/")}
        >
          EcoStore
        </Button>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <Cart />
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setLocation("/profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setLocation("/admin")}
                    >
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => setLocation("/auth")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}