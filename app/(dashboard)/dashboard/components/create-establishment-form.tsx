"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader } from "lucide-react";
import { states, countries } from "@/lib/consts";

import { createEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

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

const formSchema = z.object({
  establishmentName: z
    .string()
    .min(2, {
      message: "Establishment name must be at least 2 characters.",
    })
    .trim(),
  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .trim(),
  city: z
    .string()
    .min(2, {
      message: "City must be at least 2 characters.",
    })
    .trim(),
  state: z
    .string()
    .min(2, {
      message: "State must be at least 2 characters.",
    })
    .trim(),
  postal: z
    .string()
    .min(2, {
      message: "Postal code must be at least 2 characters.",
    })
    .trim(),
  country: z
    .string()
    .min(2, {
      message: "Country must be at least 2 characters.",
    })
    .trim(),
  chairs: z.coerce.number().min(1, {
    message: "Chairs must be at least 1.",
  }),
});

export default function CreateEstablishmentForm() {
  const router = useRouter();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const establishment = await createEstablishmentAction({
        name: values.establishmentName,
        address: values.address,
        city: values.city,
        state: values.state,
        postal: values.postal,
        country: values.country,
        chairs: values.chairs,
        presets: ["After Client", "End of Day", "Weekly"],
      });

      if (establishment) {
        toast({
          title: "Establishment created",
        });

        router.push("/dashboard");
      }
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }

  return (
    <div className="w-full mx-auto mt-12">
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
                <FormDescription>
                  This is your name of your establishment.
                </FormDescription>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state) => {
                      return (
                        <SelectItem
                          key={state}
                          value={state.toLocaleLowerCase()}
                        >
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
                  Number of chairs in your establishment, this can be changed
                  later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading && <Loader className="mr-2 animate-spin" />}Register
          </Button>
        </form>
      </Form>
    </div>
  );
}
