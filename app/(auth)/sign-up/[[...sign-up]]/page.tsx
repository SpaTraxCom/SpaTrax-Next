import { getInviteAction } from "@/app/(dashboard)/actions/invites";
import { SignUp } from "@clerk/nextjs";

type tParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({
  searchParams,
}: {
  searchParams: tParams;
}) {
  const { inviteId } = await searchParams;
  let invite;

  if (inviteId) {
    try {
      invite = await getInviteAction(+inviteId);
    } catch (e) {
      console.log(`[Error]: ${e}`);
    }
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
