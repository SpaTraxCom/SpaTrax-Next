"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader, Trash } from "lucide-react";
import { states, countries } from "@/lib/consts";

import { editEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { InferSelectModel } from "drizzle-orm";
import { establishmentsTable } from "@/lib/db/schema";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  establishmentName: z.string().min(2, {
    message: "Establishment name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  postal: z.string().min(2, {
    message: "Postal code must be at least 2 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  chairs: z.coerce.number().min(1, {
    message: "Chairs must be at least 1.",
  }),
});

interface Props {
  establishment: InferSelectModel<typeof establishmentsTable>;
}

export function SettingsForm(props: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<string[]>([]);

  useEffect(() => {
    setPresets(props.establishment.presets || []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      establishmentName: props.establishment.business_name,
      address: props.establishment.address,
      city: props.establishment.city,
      state: props.establishment.state,
      postal: props.establishment.postal,
      country: props.establishment.country,
      chairs: props.establishment.chairs,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const establishment = await editEstablishmentAction({
        id: props.establishment.id,
        name: values.establishmentName,
        address: values.address,
        city: values.city,
        state: values.state,
        postal: values.postal,
        country: values.country,
        chairs: values.chairs,
        presets: presets,
      });

      if (establishment)
        toast({
          title: "Settings updated",
        });
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }

  function removePreset(preset: string) {
    setPresets(presets.filter((pre) => pre !== preset));
  }

  function setPresetValue(index: number, value: string) {
    const prev = [...presets];
    prev[index] = value;
    setPresets(prev);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Establishment Name */}
        <FormField
          control={form.control}
          name="establishmentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Establishment Name</FormLabel>
              <FormControl>
                <Input placeholder="Foobar Spa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => {
                    return (
                      <SelectItem
                        key={country}
                        value={country.toLocaleLowerCase()}
                      >
                        {country}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Las Vegas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {states.map((state) => {
                    return (
                      <SelectItem key={state} value={state.toLocaleLowerCase()}>
                        {state}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Postal */}
        <FormField
          control={form.control}
          name="postal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Chairs */}
        <FormField
          control={form.control}
          name="chairs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chairs</FormLabel>
              <FormControl>
                <Input type="number" placeholder="8" {...field} />
              </FormControl>
              <FormDescription>
                Number of chairs in your establishment, this can be changed at
                any time.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Presets */}
        <div className="space-y-2">
          <Label>Presets</Label>
          {(presets || []).map((preset, index) => {
            return (
              <div key={index} className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => removePreset(preset)}
                >
                  <Trash />
                </Button>
                <Input
                  defaultValue={preset}
                  onChange={(e) => setPresetValue(index, e.target.value)}
                />
              </div>
            );
          })}
          <Button
            variant={"secondary"}
            type="button"
            onClick={() => setPresets([...presets, ""])}
          >
            Add Preset
          </Button>
          <FormDescription>
            Notes to attach to a cleaning log, multiple may be added to each
            individual log.
          </FormDescription>
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <Loader className="mr-2 animate-spin" />}Submit
        </Button>
      </form>
    </Form>
  );
}
