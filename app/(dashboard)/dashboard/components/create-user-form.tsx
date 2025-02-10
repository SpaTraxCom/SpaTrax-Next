"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader } from "lucide-react";

import { createTeamMemberAction } from "@/app/(dashboard)/actions/team";
import {
  createInviteAction,
  sendInviteEmailAction,
} from "@/app/(dashboard)/actions/invites";

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InferSelectModel } from "drizzle-orm";
import { establishmentsTable } from "@/lib/db/schema";

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
  role: z.enum(["employee", "manager"]),
  chair: z.coerce.number().optional(),
});

interface Props {
  establishment: InferSelectModel<typeof establishmentsTable>;
}

export default function CreateUserForm(props: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  let now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "employee",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const createdUser = await createTeamMemberAction({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        chair: values.chair,
      });

      // TODO: Error handling
      if (!createdUser) return;

      toast({
        title: "Team member added",
      });

      const createdInvite = await createInviteAction(
        createdUser.id,
        createdUser.email
      );

      if (!createdInvite) return;

      await sendInviteEmailAction({
        invitedFirstName: values.firstName,
        invitedLastName: values.lastName,
        invitedEmail: values.email,
        inviteId: createdInvite.id,
      });
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
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
          {/* Chair */}
          <FormField
            control={form.control}
            name="chair"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Chair</FormLabel>
                <Select onValueChange={field.onChange}>
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

          <Button type="submit" disabled={loading}>
            {loading && <Loader className="mr-2 animate-spin" />}Add User
          </Button>
        </form>
      </Form>
    </div>
  );
}
