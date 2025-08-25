
import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Post from '../models/postModel.js';
import User from '../models/User.js';
// Add post

export const addPost = async (req,res) =>{

    try{

        const {userId} = req.auth();
        const {content,post_type} = req.body;

        console.log("addPost hit", req.body, req.files);

        const images = req.files;

        let image_urls=[]
        if(images.length){
            image_urls = await Promise.all(
                images.map(async (image) =>{
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                            file: fileBuffer,
                            fileName: image.originalname,
                            folder:'posts',
                          });
                    
                          const url = imagekit.url({
                            path: response.filePath,
                            transformation: [
                              { quality: "auto" },
                              { format: "webp" },
                              { width: "1280" },
                            ],
                          });
                        
                          return url
                })
            )}

            //logs 
            console.log("Before create");
                 await Post.create({
                    user:userId,
                    content,
                    image_urls,
                    post_type,
                 })   
                 
                 //logs 
                 console.log("Before create");
           res.json({
            success:true,
            message:"Post created Successfully"
           })
              //Debugging
           

        
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message,
        })

    }
     
}

// Get Posts Controller

export const getFeedPosts = async (req,res)=>{
 
    try{
    const {userId}  = req.auth();
    
    const user = await User.findById(userId);

    //user connections and following

    const userIds=[userId, ...user.connections, ...user.following]

    const posts = await Post.find({user: {$in:userIds}}).populate('user').sort
    ({createdAt:-1});

        res.json({
            success:true,
            posts,
        })

    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message,
        })

    }

}

// Like Posts

export const likePost = async (req,res) =>{
    try{

        const {userId} = req.auth();
        const { postId } = req.body;

       const post = await Post.findById(postId);

       if(post.likes_count.includes(userId)){
        post.likes_count=post.likes_count.filter(user=>user !== userId);
        await post.save();
        res.json({
            success:true,
            message:'Post Unliked'
        })                       
       }
       else{
        post.likes_count.push(userId);
        await post.save();
        res.json({
            success:true,
            message:"Post Liked"
        })
       }

      
 

    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message,
        })
    }
}