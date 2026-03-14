const checkGamepass = async (username, gamepassId) => {
  try {
    // 1. Get user id
    const res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
    const data = await res.json();
    
    if (!data.data || data.data.length === 0) {
      console.log("User not found");
      return;
    }
    
    const userId = data.data[0].id;
    console.log("User ID:", userId);

    // 2. Check gamepass
    const invRes = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gamepassId}/is-owned`);
    const invData = await invRes.text();
    console.log("Gamepass", gamepassId, "Owned:", invData);
  } catch(e) {
    console.error(e);
  }
}

checkGamepass("Roblox", 1699936888);
