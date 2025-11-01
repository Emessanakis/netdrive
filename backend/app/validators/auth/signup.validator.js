import db from "../../models/index.js";
const { user: User, role: Role, Sequelize } = db;

// 1. Check for duplicate username or email
const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const { username, email } = req.body;

    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username }, { email }],
      },
    });

    if (user) {
      if (user.username === username) {
        return res.status(400).send({ message: "Failed! Username is already in use!" });
      }
      if (user.email === email) {
        return res.status(400).send({ message: "Failed! Email is already in use!" });
      }
    }

    next();
  } catch (error) {
    console.error("Duplicate check error:", error.message);
    return res.status(500).send({ message: "Internal server error during validation." });
  }
};

// 2. Check if roles exist by querying the database directly
const checkRolesExisted = async (req, res, next) => {
  try {
    const { role } = req.body; 
    const requestedRoleName = (role || "user").toLowerCase();

    // Check the database (Role model) for the existence of the requested role name
    const roleExists = await Role.findOne({ where: { name: requestedRoleName } });

    if (!roleExists) {
      return res.status(400).send({
        message: `Failed! Role does not exist: ${requestedRoleName}`,
      });
    }

    next();
  } catch (error) {
    // Log the error for debugging on the server side
    console.error("Role existence check error:", error.message);
    // CRITICAL: We changed this to 500 because a database error is a server issue, not a client validation error.
    return res.status(500).send({ message: "Internal server error during role validation." });
  }
};

const signUpValidators = { checkDuplicateUsernameOrEmail, checkRolesExisted };

export default signUpValidators;