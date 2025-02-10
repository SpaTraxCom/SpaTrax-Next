"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader } from "lucide-react";

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
import { InferSelectModel } from "drizzle-orm";
import { establishmentsTable, usersTable } from "@/lib/db/schema";
import { editTeamMemberAction } from "../../actions/team";
import SigPad from "../../components/signature-pad";

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, {
      message: "First name length must be at least 1",
    })
    .trim(),
  lastName: z
    .string()
    .min(1, {
      message: "First name length must be at least 1",
    })
    .trim(),
  email: z.string().email().trim(),
  role: z.enum(["employee", "manager", "admin"]),
  chair: z.coerce.number().optional(),
  esignature: z.string().optional(),
});

interface Props {
  establishment: InferSelectModel<typeof establishmentsTable>;
  user: InferSelectModel<typeof usersTable>;
}

export default function UserForm(props: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: props.user.first_name,
      lastName: props.user.last_name,
      email: props.user.email,
      role: props.user.role || undefined,
      chair: props.user.default_chair ? +props.user.default_chair : undefined,
      esignature: props.user.esignature ? props.user.esignature : undefined,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const updatedMember = await editTeamMemberAction({
        id: props.user.id,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        chair: values.chair ? values.chair.toString() : "",
        esignature: values.esignature ? values.esignature : undefined,
      });

      if (updatedMember)
        toast({
          title: "Team member updated",
        });
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  }

  function setSignature(signature: string) {
    form.setValue("esignature", signature.toString());
  }

  return (
    <div className="w-full mx-auto mt-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Role */}
          {props.user.role !== "admin" && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["employee", "manager"].map((role) => {
                        return (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Chair */}
          <FormField
            control={form.control}
            name="chair"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Chair</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={
                    field.value ? field.value.toString() : undefined
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a chair" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from(
                      { length: props.establishment.chairs },
                      (_, i) => i + 1
                    ).map((chair) => {
                      return (
                        <SelectItem key={chair} value={chair.toString()}>
                          {chair}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
                <FormDescription>Optional</FormDescription>
              </FormItem>
            )}
          />

          <div className="border p-4">
            <SigPad
              preSignature={props.user.esignature}
              onSave={setSignature}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader className="mr-2 animate-spin" />}Update User
          </Button>
        </form>
      </Form>
    </div>
  );
}
