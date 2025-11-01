import { authJwt } from "../middleware/index.js";
import userControllers from "../controllers/user/index.js";

// Destructure controllers from the 'access' module
const { allAccess, userBoard, moderatorBoard, adminBoard } = userControllers.access;

const userRoutes = (app) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  app.get("/api/test/all", allAccess);

  app.get("/api/test/user", [authJwt.verifyToken], userBoard);

  app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isModerator], moderatorBoard);

  app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], adminBoard);
};

export default userRoutes;
