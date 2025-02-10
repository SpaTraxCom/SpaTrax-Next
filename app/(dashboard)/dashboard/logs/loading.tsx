import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-full grid place-items-center">
      <Loader className="animate-spin text-xl" />
    </div>
  );
}
