import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
import { checkId } from "../../Helpers.js";
const router = Router();
import * as help from "../../Helpers.js";
import { generateUploadURL } from '../../utils/s3.js';
import multer from 'multer';

axios.defaults.withCredentials = true;

router
  .get("/signup", async (req, res) => {
    return res.render("user/userSignUp", {
      layout: "main",
    });
  })
  .post("/signup", authController.userSignup);

router
  .get("/login", async (req, res) => {
    return res.render("user/userLogin", {
      layout: "main",
    });
  })
  .post("/login", authController.userLogin);

router.get("/home", authController.protectRoute, async (req, res) => {
  const user = req.user;

  try {
    const response = await axios.get(
      "http://localhost:3000/api/v1/user/fromCoord",
      {
        params: {
          lng: user.location.coordinates[0],
          lat: user.location.coordinates[1],
        },
      }
    );
    let users = response.data.data.users;
    return res.render("user/userHome", {
      layout: "userHome.layout.handlebars",
      users,
      user,
    });
  } catch (err) {
    //console.log(err.message);
  }
});

router.post("/logout", async (req, res) => {
  if (req.cookies.jwt) {
    res.clearCookie("jwt");
  }
  return res.render("user/userLogin");
});

router.get("/profile", authController.protectRoute, async (req, res) => {
  const user = req.user;
  return res.render("user/userProfile", {
    layout: "userProfile.layout.handlebars",
    user,
  });
});

router.get("/get/myPosts", authController.protectRoute, async (req, res) => {
  const user = req.user; 
  let posts=[];
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts/get/myPosts",
    {headers:req.headers});
    posts = response.data.data.posts;
    if(!posts)
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title:"MY POSTS"
    });
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title:"MY POSTS"
    });

  } catch (err) {
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title:"MY POSTS"
    });
  }
});

router.get("/home/search", authController.protectRoute, async (req, res) => {
  const user = req.user;
  try {
    const { selectUser, favoriteWorkout, searchType, search } = req.query;

    let users;

    if (selectUser && favoriteWorkout && searchType && search) {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/search",
        {
          params: {
            selectUser,
            favoriteWorkout,
            searchType,
            search,
          },
        }
      );
      users = response.data.data.user;
      //console.log(users);
      return res.render("user/userHome", {
        layout: "userHome.layout.handlebars",
        users,
        user,
      });
    }
  } catch (err) {
    //console.log(err.message);
  }
});

router.get("/events", authController.protectRoute, async (req, res) => {
  const user = req.user;

  try {
    const response = await axios.get("http://localhost:3000/api/v1/events");
    const events = response.data.data;
    return res.render("user/userEvents", {
      layout: "userHome.layout.handlebars",
      events,
      user,
    });
  } catch (err) {
    //console.log(err);
  }
});
router.get("/posts", authController.protectRoute, async (req, res) => {
  const user = req.user;
  let posts = [];
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts",
    {headers:req.headers});   //This had to be added.
    posts = response.data.data.posts;
    // console.log(response.data.data.posts);
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });

  } catch (err) {
    posts= [];
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });
  }
});

router.get("/:userName", authController.protectRoute, async (req, res) => {
  const user = req.user;
  //console.log(req.params.userName);
  try {
    const response = await axios.get(
      `http://localhost:3000/api/v1/user/${req.params.userName}`
    );
    const user = response.data.data.user;
    return res.render("user/userPage", {
      layout: "main.handlebars",
      user,
    });
  } catch (err) {
    //console.log(err);
  }
});

router.get("/profile/edit", authController.protectRoute, async (req, res) => {
  res.render("user/userEditProfile", {
    layout: "userEditProfile.layout.handlebars",
  });
});

router.get(
  "/profile/workout",
  authController.protectRoute,
  async (req, res) => {
    res.render("user/userWorkouts", {
      layout: "userEditProfile.layout.handlebars",
    });
  }
);

router.get(
  "/post/:id", 
  authController.protectRoute, 
  async (req, res) => {
    let id=req.params.id;
    try{
    id = req.params.id;
    id = help.checkId(id);
    }catch(e)
    {
      return res.render("user/postEntity", {
        layout: "userHome.layout.handlebars",
        post,
        hasData:true,
        error: "ID seems to be invalid, this shouldn't be possible"
      });
    }  
    try {
      const response =  await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        {headers:req.headers}
      );
      const post = response.data.data.post;
      return res.render("user/postEntity", {
        layout: "userHome.layout.handlebars",
        post,
        hasData:true,

      });
    } catch (err) {
      return res.redirect("/user/posts");
    }
  }
)

//We have to make a new create new post function
router
  .get("/create/newPosts", async (req, res) => {
    return res.render("user/userCreatePost", {
      layout: "main",
      title:"NEW POST",
      hasData: true
    });
  });


//Insert the code for image insertion.
  // Set up multer storage and file naming
  const storage = multer.memoryStorage(); // Use memory storage for handling file in memory

  // Initialize multer with specified storage options
  const upload = multer({ storage: storage });

router.post(
  "/create/newPosts", 
  authController.protectRoute, 
  upload.single('imageInput'),
  async (req, res) => {
    let img = undefined;
    try{
/////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Initially img value is going to be empty.
    //Therefore we need to fill it first, before we start with the validation part
    const url = await generateUploadURL();
    await fetch(url,{
              method:"PUT",
              headers: {
                  "Content-Type": "multipart/form-data"
              },
              body: req.file.buffer
            });
    img = url.split('?')[0];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }catch(e)
    {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title:"NEW POST",
        hasData: false,
        error: "AWS ERROR"
      });
    }
    let {title,description,comment} = req.body;
    req.body = {...{title:title,description:description,img:img}, ...req.body};
    if(!title || !img || !description)
    {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title:"NEW POST",
        hasData: false,
        error: "Some Fields were missing, all of the fields above, except the comment one are required "
      });
    }
    try
    {
      title = help.checkString(title);
      img = help.checkString(img);
      description = help.checkString(description);
    } catch(e)
    {
      return res.status(400).render("user/userCreatePost", {
        layout: "main",
        title:"NEW POST",
        hasData: false,
        error: "Some Fields are not in a proper format"
      });
    }
    let post = undefined;
    try {
      const response =  await axios.post(
        `http://localhost:3000/api/v1/posts/`,
        req.body, {headers:{Cookie:`jwt=${req.cookies.jwt}`}}                                         //req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}        //{title,description,img},{headers:req.headers}
      );
      post = response.data.data.post;
      if(!post)
      {
        throw "This is some kind of an internal server error";
      };
      } catch (err) {
        return res.status(500).render("user/userCreatePost", {
          layout: "main",
          title:"NEW POST",
          hasData: false,
          error: "Axios error"
        });
      }
      try{
      //Now Since the Post has been created
      if(!comment)
      {
        return res.redirect("/user/posts");
      }
      else
      {
        req.body = {...{comment:comment}, ...req.body};
        comment = help.checkString(comment);
        const response_2 = await axios.post(
          `http://localhost:3000/api/v1/posts/${post._id}/comments`,
          req.body, {headers:{Cookie:`jwt=${req.cookies.jwt}`}} 
        );
        const post_2 = response_2.data.data.post;
        if(!post_2)
        {
          return res.status(500).render("user/userCreatePost", {
          layout: "main",
          title:"NEW POST",
          hasData: false,
          error: "Internal Server error, occured while creating comment"
        });
        }
        return res.redirect("/user/posts");
      }
    }catch (e)
    {
      return res.status(500).render("user/userCreatePost", {
        layout: "main",
        title:"NEW POST",
        hasData: false,
        error: "This seems to be kind of an Internal Server error"
      });
    }
  
  });

//////////////////UPDATE FUNCTION
router.get(
  "/update/post/:id", 
  authController.protectRoute, 
  async (req, res) => {
    let id;
    try{
    id = req.params.id;
    id=help.checkId(id);
    }catch(e)
    {
      return res.redirect("/user/get/myPosts");
    }  
    try {
      const response =  await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        {headers:req.headers}
      );
      const post = response.data.data.post;
      if(!post)
      {
        return res.redirect("/user/get/myPosts");
      }
      return res.render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData:true,
        title:"UPDATE POST"
      });
    } catch (err) {
      return res.redirect("/user/get/myPosts");
    }
  }
)

//////////////////DELETE FUNCTION
router.get(
  "/delete/post/:id", 
  authController.protectRoute, 
  async (req, res) => {
    let id;
    try{
    id = req.params.id;
    id=help.checkId(id);
    }catch(e)
    {
      return res.redirect("/user/get/myPosts");
    }  
    try {
      const response =  await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        {headers:req.headers}
      );
      const post = response.data.data.post;
      if(!post)
      {
        return res.redirect("/user/get/myPosts");
      }
      return res.render("user/postDeleteEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData:true,
        title:"UPDATE POST"
      });
    } catch (err) {
      return res.redirect("/user/get/myPosts");
    }
  }
)

router.post(
  "/post/addComment", 
  authController.protectRoute, 
  async (req, res) => {
    let {id,comment} = req.body;

    //Checking if id and comment is there
    if(!id || !comment)
    {
      return res.redirect("/user/posts");
    }
    
    //Checking if id and comment is correct
    try{
      id=help.checkId(id);
      comment=help.checkString(comment);
    }catch(e)
    {
      return res.redirect("/user/posts");
    } 
     
    try {
      const response =  await axios.post(
        `http://localhost:3000/api/v1/posts/${id}/comments`,
        req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
      );
      const post = response.data.data.post;
      if(!post)
      {
        return res.redirect("/user/posts");
      }

      return res.render("user/postEntity", {
        layout: "userHome.layout.handlebars",
        post,
        title:"POST",
        hasData:true,
        error:""
      });
    } catch (err) {
      return res.redirect("/user/posts");
    }
  }
)

router.post(
  "/update/post", 
  authController.protectRoute,
  async (req, res) => {
    let {title,description,id,titleOld,descriptionOld,imageSrc} = req.body;
    console.log(req.body)
    
    try
    {
      id = help.checkId(id);
      title = help.checkString(title);
      description = help.checkString(description);
      titleOld = help.checkString(titleOld);
      descriptionOld = help.checkString(descriptionOld);

    }catch(e)
    {
      return res.status(400).render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        hasData:true,
        title:"UPDATE POST",
        post:{title:titleOld,description:descriptionOld,_id:id,img:imageSrc},
        error:e
      });
    }
    if(!id)
    {
      //This should never come to pass, but if it does, it could be because of lags
      return res.redirect("/user/get/myPosts");
    }
    if(!title || !description)
    {
      return res.status(400).render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        hasData:true,
        title:"UPDATE POST",
        post:{title:titleOld,description:descriptionOld,_id:id,img:imageSrc},
        error:"The fields in the form cannot be empty or just spaces"
      });
    }

    try {
      if(title ===titleOld && description === descriptionOld)
      {
        return res.status(400).render("user/postUpdateEntity", {
          layout: "userProfile.layout.handlebars",
          hasData:true,
          title:"UPDATE POST",
          post:{title:titleOld,description:descriptionOld,_id:id,img:imageSrc},
          error:"No Change in the initial values"
        });
      }
      const response =  await axios.patch(
        `http://localhost:3000/api/v1/posts/${id}`,
        req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
      );
      const updatedPost = response.data.data.post;
      console.log("The updated post is : ",updatedPost);

      if(!updatedPost)
      {
        return res.status(500).render("user/postUpdateEntity", {
          layout: "userProfile.layout.handlebars",
          hasData:true,
          title:"UPDATE POST",
          post:{title:titleOld,description:descriptionOld,_id:id,img:imageSrc},
          error:"Please Redo, there was a minor server error"
        });
      }
      //Redirect to the original page
      return res.redirect("/user/get/myPosts");

    } catch (err) {
      // console.log(err);
      return res.status(500).render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        hasData:true,
        title:"UPDATE POST",
        post:{title:titleOld,description:descriptionOld,_id:id,img:imageSrc},
        error:"Connection Error, please try this later"
      });
    }
  })
// router.post(
//   "/update/post", 
//   authController.protectRoute,
//   async (req, res) => {
//     let {title,description,id} = req.body;
//     try
//     {
//       id = help.checkId(id);
//       title = help.checkString(title);
//       description = help.checkString(description);
//     }catch(e)
//     {
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"The fields in the form cannot be empty or just spaces"
//       });
//     }
//     if(!id)
//     {
//       //This should never come to pass, but if it does, it could be because of lags
//       return res.redirect("/user/get/myPosts");
//     }
//     if(!title || !description)
//     {
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"The fields in the form cannot be empty"
//       });
//     }

//     try {
//       const response =  await axios.patch(
//         `http://localhost:3000/api/v1/posts/${id}`,
//         req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
//       );
//       const updatedPost = response.data.data.post;
//       console.log("The updated post is : ",updatedPost);

//       if(!updatedPost)
//       {
//         return res.render("user/postUpdateEntity", {
//           layout: "userProfile.layout.handlebars",
//           hasData:false,
//           title:"UPDATE POST",
//           error:"Internal Server Error"
//         });
//       }
//       //Redirect to the original page
//       return res.redirect("/user/get/myPosts");

//     } catch (err) {
//       // console.log(err);
//       return res.render("user/postUpdateEntity", {
//         layout: "userProfile.layout.handlebars",
//         hasData:false,
//         title:"UPDATE POST",
//         error:"Nothing Was Updated"
//       });
//     }
//   })

router.post(
  "/delete/post", 
  authController.protectRoute,
  async (req, res) => {
    let {title,img,description,id} = req.body;
    // console.log("THese are the contents of Req.BODY:",req.body);
    try {
      const response =  await axios.delete(
        `http://localhost:3000/api/v1/posts/${id}`,
        {data:req.body, headers:{Cookie:`jwt=${req.cookies.jwt}`}}      
      );
      const postDeletionResponse = response.data;
      // console.log("The post was : ",postDeletionResponse);

      //Redirect to the original page
      return res.redirect("/user/get/myPosts");
    } catch (err) {
      return res.redirect("/user/get/myPosts");
    }

  });



export default router;
