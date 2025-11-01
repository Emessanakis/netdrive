import inviteUserValidators from "./invite.validator.js";
import signUpValidators from "./signup.validator.js";
import checkPasswordRequiredFields from "./changePassword.validator.js"
import checkRequiredFields from "./signin.validator.js"

// Destructure functions from default exports
const { checkDuplicateEmail, checkPlanExisted } = inviteUserValidators;
const { checkDuplicateUsernameOrEmail, checkRolesExisted } = signUpValidators;

export default { 
    checkDuplicateEmail, 
    checkPlanExisted, 
    checkDuplicateUsernameOrEmail, 
    checkRolesExisted, 
    checkPasswordRequiredFields, 
    checkRequiredFields 
};