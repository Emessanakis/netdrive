import db from "../../../models/index.js";

const Plan = db.plan;

const getPlans = async (req, res) => {
  try {
    // Fetch all plans
    const plans = await Plan.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']], 
    });

    if (!plans || plans.length === 0) {
      return res.status(404).send({ message: "No subscription plans found." });
    }

    res.status(200).send({ plans: plans });

  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).send({ message: "An unexpected error occurred while fetching plans." });
  }
};


export default getPlans;
