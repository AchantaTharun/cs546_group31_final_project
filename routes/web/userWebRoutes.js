import { Router } from "express";
import * as authController from "../../controllers/authController.js";
import axios from "axios";
import { checkId } from "../../Helpers.js";
const router = Router();
import * as help from "../../Helpers.js";
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
  console.log("This is the user",user);
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts/get/myPosts",
    {headers:req.headers});
    const posts = response.data.data.posts;
    console.log(response.data.data);
    return res.render("user/userMyPosts", {
      layout: "userProfile.layout.handlebars",
      posts,
      user,
      title:"MY POSTS"
    });

  } catch (err) {
    console.log(err);
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
  try {
    const response = await axios.get("http://localhost:3000/api/v1/posts",
    {headers:req.headers});   //This had to be added.
    const posts = response.data.data.posts;
    // console.log(response.data.data);
    return res.render("user/userPosts", {
      layout: "userHome.layout.handlebars",
      posts,
      user,
    });

  } catch (err) {
    console.log(err);
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
    let id;
    try{
    id = req.params.id;
    id=help.checkId(id);
    }catch(e)
    {
      console.log("There is some ID related issues");
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
      console.log(err);
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

router.post(
  "/create/newPosts", 
  authController.protectRoute, 
  async (req, res) => {
    let {title,img,description,comment} = req.body;
    // console.log(req.body);
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
        req.body,{headers:req.headers}
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
          error: "This seems to be kind of an Internal Server error"
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
        if(!post._id)
        {
          throw "Error from the server";
        }
        comment = help.checkString(comment);
        const response_2 = await axios.post(
          `http://localhost:3000/api/v1/posts/${post._id}/comments`,
          req.body,{headers:req.headers}
        );
        const post_2 = response_2.data.data.post;
        // console.log("This is the post with the comment :",post_2);
        if(!post_2)
        {
          return res.status(500).render("user/userCreatePost", {
          layout: "main",
          title:"NEW POST",
          hasData: false,
          error: "This seems to be kind of an Internal Server error"
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
      console.log("There is some ID related issues");
    }  
    try {
      const response =  await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        {headers:req.headers}
      );
      const post = response.data.data.post;
      return res.render("user/postUpdateEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData:true,
        title:"UPDATE POST"
      });
    } catch (err) {
      console.log(err);
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
      console.log("There is some ID related issues");
    }  
    try {
      const response =  await axios.get(
        `http://localhost:3000/api/v1/posts/${id}`,
        {headers:req.headers}
      );
      const post = response.data.data.post;
      // console.log(post);
      return res.render("user/postDeleteEntity", {
        layout: "userProfile.layout.handlebars",
        post,
        hasData:true,
        title:"UPDATE POST"
      });
    } catch (err) {
      console.log(err);
    }
  }
)

router.post(
  "/post/addComment", 
  authController.protectRoute, 
  async (req, res) => {
    let {id,comment} = req.body;
    try{
    id=help.checkId(id);
    }catch(e)
    {
      console.log(`There is some ID related issues`);
    }  
    try {
      const response =  await axios.post(
        `http://localhost:3000/api/v1/posts/${id}/comments`,
        req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
      );
      const post = response.data.data.post;
      return res.render("user/postEntity", {
        layout: "userHome.layout.handlebars",
        post,
        title:"POST",
        hasData:true,

      });
    } catch (err) {
      console.log(err);
    }
  }
)

router.post(
  "/update/post", 
  authController.protectRoute,
  async (req, res) => {
    let {title,img,description,id} = req.body;
    console.log("THese are the contents of Req.BODY:",req.body);
    try {
      const response =  await axios.patch(
        `http://localhost:3000/api/v1/posts/${id}`,
        req.body,{headers:{Cookie:`jwt=${req.cookies.jwt}`}}
      );
      const updatedPost = response.data.data.post;
      console.log("The updated post is : ",updatedPost);

      //Redirect to the original page
      return res.redirect("/user/get/myPosts");

    } catch (err) {
      console.log(err);
    }
  })

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
      console.log(err);
    }

  });



export default router;
