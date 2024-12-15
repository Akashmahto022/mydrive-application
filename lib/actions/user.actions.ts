'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { parseStringify } from '../utils';
import { cookies } from 'next/headers';
import { strict } from 'assert';

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal('email', ['email'])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const habdleError = (error: unknown, message: string) => {
  console.log(error, message);

  throw error;
};

export const sendEmailOtp = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    habdleError(error, 'failed to send email OTP');
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOtp({ email });

  if (!accountId) throw new Error('Failed to send an otp');
  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          'https://api-private.atlassian.com/users/9cea692d0a59c5e100680165cbbeb496/avatar',
        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};

export const secertVerify = async ({ accountId, password }: {
  accountId: string,
  password: string
}) => {

  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true
    })


    return parseStringify({ sessionId: session.$id })

  } catch (error) {
    habdleError(error, "Failed to verigy the secret")
  }

}