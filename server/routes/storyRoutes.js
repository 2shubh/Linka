import { protect } from "../middleware/auth.js";
import express from 'express'
import { upload } from "../configs/multer.js";
import { addStory, getUserStory } from "../controllers/storyController.js";

const storyRouter = express.Router();

storyRouter.post('/create',upload.single('media'),protect,addStory);

storyRouter.get('/get',protect , getUserStory);


export default storyRouter;