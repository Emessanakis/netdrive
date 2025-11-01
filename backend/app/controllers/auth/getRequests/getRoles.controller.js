import db from "../../../models/index.js";
import { Op } from "sequelize"; 

const Role = db.role;

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        name: {
          [Op.ne]: "admin",
        },
      },
      attributes: ['id', 'name'],
    });

    if (!roles || roles.length === 0) {
      return res.status(404).send({ message: "No non-admin roles found." });
    }

    const nonAdminRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
    }));

    res.status(200).send({ roles: nonAdminRoles });

  } catch (error) {
    console.error("Error fetching non-admin roles:", error);
    res.status(500).send({ message: "An unexpected error occurred while fetching roles." });
  }
};

export default getRoles;
