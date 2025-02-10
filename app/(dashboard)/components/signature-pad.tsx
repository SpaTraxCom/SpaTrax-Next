"use client";

import { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  preSignature?: string | null;
  onSave: (signature: string) => void;
}

export default function SigPad(props: Props) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
      if (props.preSignature)
        signaturePadRef.current.fromDataURL(props.preSignature);
    }

    return () => {
      signaturePadRef.current?.off();
    };
  }, []);

  function saveSignature() {
    if (!signaturePadRef.current) return;

    const data = signaturePadRef.current.toDataURL();
    props.onSave(data.toString());

    toast({
      title: "Signature updated",
      description:
        "Be sure to save the signature change by selecting 'Update User'",
    });
  }

  function clearSignature() {
    if (!signaturePadRef.current) return;

    signaturePadRef.current.clear();
  }

  return (
    <div className="space-y-2">
      <Alert className="max-w-max">
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Please try to make your signature as large as possible while still
          fitting inside of the box.
        </AlertDescription>
      </Alert>

      <div className="border bg-white w-[400px] h-[150px]">
        <canvas ref={canvasRef} width="400" height="150"></canvas>
      </div>
      <div className="flex items-center gap-4">
        <Button type="button" onClick={clearSignature}>
          Clear
        </Button>
        <Button type="button" onClick={saveSignature}>
          Save
        </Button>
      </div>
    </div>
  );
}
