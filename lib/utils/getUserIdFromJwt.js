export const getUserIdFromJWT = async (jwt) => {
  try {
    const token = jwt;

    if (!token) {
      throw new Error("No token found.");
    }

    // ✅ Decode the JWT (base64 decode the payload part)
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload || !payload.sub) {
      throw new Error("Invalid token format.");
    }

    return payload.sub; // ✅ `sub` typically contains the `user_id`
  } catch (err) {
    console.error("❌ Error extracting userId from JWT:", err.message);

    return null;
  }
};
