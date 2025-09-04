import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String }, // Not required
  photo: { type: String }, // Not required
});

const User = models?.User || model("User", UserSchema);

export default User;