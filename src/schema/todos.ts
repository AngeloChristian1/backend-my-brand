import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
    title: {type: String, required:true},
    content: {type: String, required:true},
    isDone: {type: Boolean, required:true, default:false},
    priority: {type: String, required:true, default:"Not-Important"},
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

},
{
    timestamps: true,
  })

export const TodoModel = mongoose.model('Todo', TodoSchema)

export const getTodo = () => TodoModel.find();
export const getTodoByTitle = (title:string) => TodoModel.findOne({titlel:title});

export const getTodoById = (id:string) => TodoModel.findById(id);

export const getTodoByUserId = (id:string) => TodoModel.find({userId:id});

export const createTodo = (values:Record<string, any>) => new TodoModel(values).save()
.then((todo)=>todo.toObject());

export const deleteTodoById = (id:string)=> TodoModel.findOneAndDelete({_id:id});

export const updateTodoById = (id:string, values: Record<string, any>) => TodoModel.findByIdAndUpdate(id, values);