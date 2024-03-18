import express, { NextFunction } from 'express'
import { Request, Response } from 'express'
import {getBlogByTitle, createBlog, getBlog, getBlogById, deleteBlogById} from "../schema/blogs"
// import cloudinary from 'cloudinary'
import { uploadToCloudinary } from '../helpers/cloudinary'
import { cloudinary } from '../helpers/cloudinary'
import { Multer } from 'multer';
import {promises as fs} from 'fs'
import {join} from 'path'
import sharp from 'sharp'
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { blogSchema } from '../helpers/validate_schema'

// type File = Multer.File;
// const file: File = req.file;

interface CloudinaryFile extends Express.Multer.File {
    buffer: Buffer;
  }

interface MulterRequest extends Request {
    file: Express.Multer.File;
  }


export const uploadBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body
    
    let { title,subtitle, category, content, timeToRead} = req.body;
    const result = await blogSchema.validateAsync(req.body)
    if(!title || !content || !subtitle || !category || !content){
        return res.status(400).send({message:"Please fill in all fields"});
    }    
    
    title  = result.title
    content = result.content
    subtitle = result.subtitle
    category = result.category
    timeToRead = result.timeToRead
    const existingBlog = await getBlogByTitle(title)

    if(existingBlog){
        return res.status(400).send({message: "Blog with that title already exists"});
    }
    
    const files: CloudinaryFile[] = req.files as CloudinaryFile[];
    if (!files || files.length == 0 || files==null) {
      return res.status(400).send({message: "Please provide Image"});
    }
    const cloudinaryUrls: string[] = [];

    for (const file of files) {
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 1000, height: 800 })
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'my-blog',
        } as any,
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            return res.send({error:err})
          }
          if (!result) {
            console.error('Cloudinary upload error: Result is undefined');
            return res.send(new Error('Cloudinary upload result is undefined'));
          }
          cloudinaryUrls.push(result.secure_url);

          if (cloudinaryUrls.length === files.length) {
            //All files processed now get your images here
            req.body.poster = cloudinaryUrls[0];
            const Blog:any =  createBlog({title,subtitle, category, content, timeToRead, poster:cloudinaryUrls[0]}).then(result => {
                return res.status(200).send({status:"success", message:"Blog created successfully", data:result})
            })      

            // return res.status(200).send({files: cloudinaryUrls, body: body})  
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
  } catch (error) {
    if(error.joi== true) {
      error.status = 422
      console.log(error.message)
      return res.send({message:error.message, status:"fail"})
    }
    console.error('Error in uploadToCloudinary middleware:', error?.details[0]);
    // next(error);
    return res.send({message:"error", error:error?.details[0]})
  }
};

  export const uploadImage = async (req: MulterRequest, res: express.Response) =>{
    let cloudinary_url : String | undefined;
    try{
        // return res.status(200).send({body: req.body || "no file", file: req.files || "no file"});
        const { poster } = req.body;
        let image:CloudinaryFile[] = req.files as CloudinaryFile[];
        const cwd = process.cwd();

        await fs.writeFile(join(cwd,"src", "assets", "uploads", image[0].originalname),image[0].buffer).then(()=>{

        })

        try{
            const result =  cloudinary.uploader.upload_stream(        {
                resource_type: 'auto',
                folder: 'my-blog',
              } as any,
              (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (err) {
                  console.error('Cloudinary upload error:', err);
                  return res.send(err)
                  
                }
                if (!result) {
                  console.error('Cloudinary upload error: Result is undefined');
                  return res.send(new Error('Cloudinary upload result is undefined'));
                }
                cloudinary_url  = result.secure_url;
      
                if (cloudinary_url) {
                  //All files processed now get your images here
                  req.body.cloudinaryUrls = cloudinary_url;
                  return res.status(200).send({file: cloudinary_url})
                  
                }
              })
              result.end(image[0].buffer);
            // // const result = await cloudinary.uploader.upload({buffer: image[0].buffer})
            if(result){
                
                return res.status(200).send({message:"Successfull", urls: cloudinary_url || "no url" ,result: result})
            }

        }catch(err){
            console.log(err)
            
            return res.status(400).send({message:"Image fail 1", error: err, image: image[0].buffer});
        }
       
        
    }catch(err){
            console.log("error adding image", err);
            return res.status(500).json({
                message: "Failed to upload image to Cloudinary"
              })
        }
    }

export const addBlog = async (req: MulterRequest, res: express.Response) =>{

    try{
        const { poster,title,subtitle, category, content, timeToRead, date, time, editor } = req.body;
        const picture = "../assets/images/robot.jpg"

        if(!poster || !title || !content || !subtitle || !category || !content){
            return res.sendStatus(400);
        }

        const existingBlog = await getBlogByTitle(title)

        if(existingBlog){
            return res.status(400).send({message: "Blog with that title already exists"});
        }

        cloudinary.uploader.upload(picture).then(result=>{
            
            return res.status(200).send({message: "image can go"})
            }) 
        // try{
        //     const result = await cloudinary.uploader.upload("assets/images/blog2.jpg")
       

        // }catch(err){
        //     console.log("error adding image", err);
        //     return res.status(500).json({
        //         message: "Failed to upload image to Cloudinary",
        //       })
        // }
        const Blog = await createBlog({poster,title,subtitle, category, content, timeToRead, date, time, editor})        
        return res.status(200).send({status:"success", data:Blog})

    } catch(error){
        console.log('error', error);
        return res.status(400).send({status:"error", error:error});
    }
}

 
export const getAllBlogs = async (req:express.Request, res:express.Response)=>{
    try{
      
        const Blogs =await getBlog();
        return res.status(200).json(Blogs)
    } 
    catch(error){ 
        console.log(error)
        return res.status(400).send({message:"error getting all blogs"})
    }
}

export const getOneBlogById = async (req:express.Request, res:express.Response)=>{
    try{
        const {id} = req.params;
        const Blog =await getBlogById(id);
          if(!Blog){
            return res.status(404).send({message: "Blog not found"});
        }
        return res.status(200).send({message:"Blog retrieved successfully",data:Blog})
    } 
    catch(error){
        console.log(error)
        return res.status(400).send({message:"Error Occured"});
    }
}

export const deleteBlog = async (req:express.Request, res:express.Response)=>{
    try{

        const {id} = req.params;
        const Blog =await getBlogById(id);
        if(!Blog){
            return res.status(404).send({message: "Blog not found"});
        }
        const deletedBlog = await deleteBlogById(id);

        return res.send({message:"Blog deleted sussessfully", deletedBlog:deletedBlog})
    }catch(error){
        console.log(error)
        return res.status(400).send({status:"error", error:error});

    }
}


export const updateBlog = async (req:express.Request, res:express.Response)=>{
    let myBlog:Object
    try{
        const {id} = req.params;
        const existingBlog =await getBlogById(id);
        if(!existingBlog){
            return res.status(404).send({message: "Blog not found"});
        }
        const {poster,title,subtitle, category, content, timeToRead} = req.body;

        if(!poster || !title || !content || !subtitle || !category || !content){
            return res.status(400).send({message:"Invalid"});
        }

        let Blog = await getBlogById(id);
        
        if (!Blog) {
            return res.status(404).send({message:"Blog not found"});
        }

        Blog.poster = poster;
        Blog.title = title;
        Blog.category = category;
        Blog.content = content;
        Blog.timeToRead = timeToRead;
        Blog.subtitle= subtitle;

        const updatedBlog = await Blog.save();
        
        // return res.sendStatus(200).json(Blog).end();
        return res.status(200).send({status:"success", data: updatedBlog});

    }catch(error){
        console.log(error)
        return res.status(400).send({message:"Blog update failed"})
    }
}



export const editBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body
    const {id}= req.params
   
    let { title,subtitle, category, content, timeToRead} = req.body;
    if(!title && !content && !subtitle && !category && !content){
        return res.status(400).send({message:"Please fill in all fields"});
    }

    const existingBlog = await getBlogById(id)

    if(!existingBlog){
        return res.status(404).send({message: "Blog not found", status:"fail"});
    }
    
    if(req.files){
          const files: CloudinaryFile[] = req.files as CloudinaryFile[];
    if (!files || files.length == 0 || files==null) {
      return res.status(400).send({message: "Please provide Image", status:"fail"});
    }

    const cloudinaryUrls: string[] = [];

    for (const file of files) {
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 1000, height: 800 })
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'my-blog',
        } as any,
        (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            return res.send({error:err})
          }
          if (!result) {
            console.error('Cloudinary upload error: Result is undefined');
            return res.send(new Error('Cloudinary upload result is undefined'));
          }
          cloudinaryUrls.push(result.secure_url);

          if (cloudinaryUrls.length === files.length) {
            //All files processed now get your images here
            req.body.poster = cloudinaryUrls[0] || null;
            
            existingBlog.poster= cloudinaryUrls[0] || existingBlog.poster,
            existingBlog.title =  title || existingBlog.title,
            existingBlog.subtitle= subtitle || existingBlog.subtitle,
            existingBlog.category =  category || existingBlog.category,
            existingBlog.content = content || existingBlog.content,
            existingBlog.timeToRead= timeToRead || existingBlog.timeToRead
            

            const updatedBlog = existingBlog.save()
            // const Blog:any =  createBlog({title,subtitle, category, content, timeToRead, poster:cloudinaryUrls[0]}).then(result => {
            //     return res.status(200).send({status:"Blog Added successfully", data:result})
            // })      

            return res.status(200).send({message:"Blog updated",status:"success", updatedBlog: existingBlog})  
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
    }

  } catch (error) {
    console.error('Error in uploadToCloudinary middleware:', error);
    next(error);
  }
};
