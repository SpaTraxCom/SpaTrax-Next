import { getInviteAction } from "@/app/(dashboard)/actions/invites";
import { SignUp } from "@clerk/nextjs";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { inviteId } = await searchParams;
  let invite;

  if (inviteId) {
    invite = await getInviteAction(+inviteId);
  }

  if (invite && invite.accepted)
    return <h1>Invite has already been accepted.</h1>;

  return (
    <SignUp
      initialValues={{
        emailAddress: invite?.invite_email,
      }}
      unsafeMetadata={{ inviteId }}
    />
  );
}
