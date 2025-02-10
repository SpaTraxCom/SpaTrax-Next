"use client";

import { InferSelectModel } from "drizzle-orm";
import { usersTable } from "@/lib/db/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

import { editTeamMemberSignatureAction } from "@/app/(dashboard)/actions/team";
import { createLogAction } from "@/app/(dashboard)/actions/logs";
import SigPad from "@/app/(dashboard)/components/signature-pad";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  performed_at: z.string(), // TODO: Look into making this a date at Zod level
  chair: z.coerce.number().min(1, {
    message: "Chair must be at least 1",
  }),
  user: z.string().min(1, {
    message: "User length must be at least 2",
  }),
});

interface Props {
  team: InferSelectModel<typeof usersTable>[];
  chairs: number;
  presets: string[];
  technician?: InferSelectModel<typeof usersTable>;
}

export default function CreateLogForm(props: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signatureSet, setSignatureSet] = useState(false);
  const [presets, setPresets] = useState<string[]>([]);

  useEffect(() => {
    if (props.technician?.esignature) setSignatureSet(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performed_at: now.toISOString().slice(0, 16),
      user: props.technician ? props.technician.id.toString() : undefined,
      chair: props.technician?.default_chair
        ? +props.technician.default_chair
        : undefined,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const createdLog = await createLogAction({
        performed_at: new Date(values.performed_at),
        chair: values.chair,
        user_id: +values.user,
        presets,
      });

      if (createdLog)
        toast({
          title: "Log created",
        });
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }

  function onTechChange(techId: string) {
    const tech = props.team.find((tech) => tech.id === +techId);
    if (!tech) return;

    setSignatureSet(!!tech.esignature);
    if (tech.default_chair) form.setValue("chair", +tech.default_chair);
  }

  function setTimeToNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    form.setValue("performed_at", now.toISOString().slice(0, 16));
  }

  async function saveSignature(sig: string) {
    const techId = form.getValues("user");
    if (!techId) return;

    const tech = props.team.find((tech) => tech.id === +techId);
    if (!tech) return;

    try {
      await editTeamMemberSignatureAction({
        id: tech.id,
        esignature: sig,
      });

      setSignatureSet(true);
    } catch (e) {
      console.log(e);
    }
  }

  function presetToggled(preset: string, value: boolean) {
    let prev = [...presets];

    if (value) {
      prev.push(preset);
    } else {
      prev = prev.filter((pre) => pre !== preset);
    }

    setPresets(prev);
  }

  return (
    <div className="w-full mx-auto mt-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Performed At */}
          <FormField
            control={form.control}
            name="performed_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-x-4">
                  1&#41; Performed At{" "}
                  <RefreshCw
                    className="h-4 cursor-pointer"
                    onClick={setTimeToNow}
                  />
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  The time the cleaning was performed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* User */}
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>2&#41; Technician</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onTechChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a technician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {props.team.map((member) => {
                      return (
                        <SelectItem
                          key={member.id}
                          value={member.id.toString()}
                        >
                          {member.first_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.email}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {!signatureSet && (
            <Dialog>
              <DialogTrigger>
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2">
                  Add Signature
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Signature</DialogTitle>
                  <DialogDescription>
                    Please add a signature in the box below to be able to submit
                    a cleaning log.
                  </DialogDescription>
                  <div className="p-4">
                    <SigPad onSave={saveSignature} />
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}

          {/* Chair */}
          <FormField
            control={form.control}
            name="chair"
            render={({ field }) => (
              <FormItem>
                <FormLabel>3&#41; Chair</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chair" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: props.chairs }, (_, i) => i + 1).map(
                      (chair) => {
                        return (
                          <SelectItem key={chair} value={chair.toString()}>
                            {chair}
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Preset */}
          {/* <FormField
            control={form.control}
            name="presets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>4&#41; Presets</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  TODO: Make this a multi-select dropdown of presets
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <div>
            <FormLabel>4&#41; Presets</FormLabel>
            <div className="mt-2 space-y-2">
              {props.presets.map((preset, index) => {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      id={preset}
                      onCheckedChange={(e) =>
                        presetToggled(preset, e as boolean)
                      }
                    />
                    <FormLabel htmlFor={preset} className="font-normal">
                      {preset}
                    </FormLabel>
                  </div>
                );
              })}
            </div>
          </div>

          {!signatureSet && (
            <Alert variant={"destructive"}>
              <AlertTitle>
                Technician does not have a signature setup.
              </AlertTitle>
              <AlertDescription>
                You will not be able to create a log with this technician until
                a signature has been set up.
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading || !signatureSet}>
            {loading && <Loader className="mr-2 animate-spin" />}Add log
          </Button>
        </form>
      </Form>
    </div>
  );
}
