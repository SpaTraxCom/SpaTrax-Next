import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <div className="container mx-auto p-4 flex justify-between">
      <Link href={"/"}>
        <h1 className="text-2xl">
          <span className="text-primary font-bold">Spa</span>Trax
        </h1>
      </Link>
      <div>
        <SignedIn>
          <div className="flex space-x-4 items-center">
            <Link href={"dashboard"}>
              <Button>Dashboard</Button>
            </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <div className="space-x-4">
            <Link href={"sign-in"}>
              <Button>Sign In</Button>
            </Link>
            <Link href={"sign-up"}>
              <Button>Register</Button>
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
