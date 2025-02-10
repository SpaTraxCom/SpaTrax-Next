import { getInviteAction } from "@/app/(dashboard)/actions/invites";
import { SignUp } from "@clerk/nextjs";

type tParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({ params }: { params: tParams }) {
  const { inviteId } = await params;
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
