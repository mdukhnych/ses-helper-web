import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_FIRESTORE } from "@/firebaseConfug";

export async function GET() {
  try {
    const menuSnapshot = await getDocs(collection(FIREBASE_FIRESTORE, "menu"));
    const menuItems = menuSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectionsData: Record<string, any[]> = {};
    await Promise.all(
      menuItems.map(async (item) => {
        const subColRef = collection(FIREBASE_FIRESTORE, item.id); // item.id = "services", "information", ...
        const subSnap = await getDocs(subColRef);

        collectionsData[item.id] = subSnap.docs.map((subDoc) => ({
          id: subDoc.id,
          ...subDoc.data(),
        }));
      })
    );

    return NextResponse.json({
      menu: menuItems,
      collections: collectionsData,
    });
  } catch (error) {
    console.error("Menu API error:", error);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}
