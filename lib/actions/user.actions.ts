"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("email", ["email"])]
    )

    return result.total > 0 ? result.documents[0] : null;
}

const habdleError = (error: unknown, message: string) => {
    console.log(error, message)

    throw error;
}

const sendEmailOtp = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email)

        return session.userId
    } catch (error) {
        habdleError(error, "failed to send email OTP");
    }
}


export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
    const existingUser = await getUserByEmail(email)

    const accountId = await sendEmailOtp({ email })

    if (!accountId) throw new Error("Failed to send an otp");
    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "https://api-private.atlassian.com/users/9cea692d0a59c5e100680165cbbeb496/avatar",
                accountId,
            }
        )
    }

    return parseStringify({ accountId })

}