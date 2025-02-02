'use server';

import { Account, ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { parseStringify } from '../utils';
import { cookies } from 'next/headers';
import { strict } from 'assert';
import { avatarPlaceholderUrl } from '@/constants';
import { Quando } from 'next/font/google';
import { use } from 'react';
import { parse } from 'postcss';
import { error } from 'console';
import { redirect } from 'next/navigation';
import { string } from 'zod';

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal('email', ['email'])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {

  throw error;
};

export const sendEmailOtp = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, 'failed to send email OTP');
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
  console.log(existingUser, "existing user")

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
        avatar: avatarPlaceholderUrl,
        accountId,
      }
    );
  }

  return parseStringify({ accountId });
};

export const secertVerify = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, 'Failed to verigy the secret');
  }
};


export const getCurrentUser = async () => {
  const { databases, account } = await createSessionClient();

  const result = await account.get();

  const user = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal('accountId', result.$id)]
  );

  if (user.total <= 0) return null;

  return parseStringify(user.documents[0])
}

export const signOutUser = async () => {
  const { account } = await createSessionClient();
  try {
    await account.deleteSession('current');
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in")
  }
}


export const signInUser = async ({ email }: { email: string }) => {
  try {
    console.log("signin user")
    const existingUser = await getUserByEmail(email);
    console.log(existingUser)
    if (existingUser) {
      await sendEmailOtp({ email });
      return parseStringify({ accountId: existingUser.accountId })
    }

    return parseStringify({ accountId: null, error: "user not found" })
  } catch (error) {
    handleError(error, "failed to sign in user")
  }
}

