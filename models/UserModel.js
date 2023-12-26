import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema(
    {
        username: String,
        email: String,
        password: String
    }
);

const User = mongoose.model.User || mongoose.model("User", UserSchema);

export default User;