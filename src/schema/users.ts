import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, required:true},
    phone: {type: String, required:true},
    profile:{type:String, default: "https://res.cloudinary.com/dms2akwoq/image/upload/v1710319701/my-blog/tmcaaxd5lyemfsuxgbx2.png"},
    authentication:{
        password:{type: String, required:true, select:false},
        salt:{type: String, select:false},
        sessionToken:{type: String, select:false},  
    },
    role: {type: String, required:true},
})

export const UserModel = mongoose.model('User', UserSchema)
export const getUsers = () => UserModel.find();
export const getUserByEmail = (email:string) => UserModel.findOne({email:email});
export const getUserBySessionToken = (sessionToken:string|any) => UserModel.findOne({
    'authentication.sessionToken': sessionToken
})
 
export const getUserById = (id:string) => UserModel.findById(id);

export const getUserByRole = (role:string) => UserModel.findById(role);
export const createUser = (values:Record<string, any>) => new UserModel(values).save()
.then((user)=>user.toObject());

export const deleteUserById = (id:string)=> UserModel.findOneAndDelete({_id:id});

export const updateUserById = (id:string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);