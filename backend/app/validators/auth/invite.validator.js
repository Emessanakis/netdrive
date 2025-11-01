import db from "../../models/index.js";

// Assuming you have 'user' and 'plan' models available
const { user: User, plan: Plan } = db; 

// 1. Check for duplicate email (Admin invite only needs to check email)
const checkDuplicateEmail = async (req, res, next) => {
	try {
		const { email } = req.body;

		// Check if a user with this email already exists in the database
		const user = await User.findOne({
			where: { email },
		});

		// NOTE: The controller handles the status (-1 pending vs 1 active). 
		// This middleware just checks for existence.
		if (user) {
			return res.status(400).send({ message: "Failed! A user with this email address already exists (active or pending)." });
		}

		next();
	} catch (error) {
		console.error("Duplicate email check error:", error.message);
		return res.status(500).send({ message: "Internal server error during email validation." });
	}
};

// 2. Check if the provided planId exists in the database
const checkPlanExisted = async (req, res, next) => {
    try {
        const { planId } = req.body;
        
        // Ensure planId is provided and is a valid number
        // Note: The frontend sends planId as a number, but it arrives here as a string from JSON body.
        const parsedPlanId = parseInt(planId, 10);

        if (!planId || isNaN(parsedPlanId)) {
            return res.status(400).send({ message: "Missing or invalid planId." });
        }

        const plan = await Plan.findByPk(parsedPlanId);

        if (!plan) {
            return res.status(400).send({
                message: `Failed! Subscription plan with ID ${parsedPlanId} does not exist.`,
            });
        }

        // Optional: Attach the plan object to the request if other middleware or the controller needs it.
        // req.plan = plan;

        next();
    } catch (error) {
        console.error("Plan existence check error:", error.message);
        return res.status(500).send({ message: "Internal server error during plan validation." });
    }
};

const inviteUserValidators = { checkDuplicateEmail, checkPlanExisted };


export default inviteUserValidators;