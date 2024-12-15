export const appwriteConfig = {
  endPointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_URL!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_URL!,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_URL!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_URL!,
  secretKey: process.env.NEXT_APPWRITE_SECRET_KEY!,
};
