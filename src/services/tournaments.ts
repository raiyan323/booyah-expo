import {
    account,
    DATABASE_ID,
    ID,
    Permission,
    Query,
    Role,
    TABLES,
    tablesDB,
} from "../lib/appwrite";

// Get all tournaments
export async function getTournaments() {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLES.tournaments,
    queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
  });

  return response;
}

// Get a single tournament
export async function getTournament(id: string) {
  return await tablesDB.getRow({
    databaseId: DATABASE_ID,
    tableId: TABLES.tournaments,
    rowId: id,
  });
}

// Join tournament
export async function joinTournament(
  tournamentId: string,
  inGameName: string,
  freeFireUid: string,
) {
  const user = await account.get();

  // Prevent duplicate requests
  const existingRequests = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLES.requests,
    queries: [
      Query.equal("userId", user.$id),
      Query.equal("tournamentId", tournamentId),
      Query.limit(1),
    ],
  });

  if (existingRequests.rows.length > 0) {
    throw new Error("You have already requested to join this tournament.");
  }

  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLES.requests,
    rowId: ID.unique(),
    data: {
      tournamentId,
      userId: user.$id,
      inGameName,
      freeFireUid,
      status: "pending",
    },
    permissions: [Permission.read(Role.user(user.$id))],
  });
}

// Get current user's tournament requests
export async function getMyRequests() {
  const user = await account.get();

  return await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLES.requests,
    queries: [
      Query.equal("userId", user.$id),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ],
  });
}

// Get room details
export async function getRoomDetails(tournamentId: string) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLES.rooms,
    queries: [Query.equal("tournamentId", tournamentId), Query.limit(1)],
  });

  return response;
}
