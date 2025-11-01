import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress, 
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

interface Role {
  id: number;
  name: string;
}

interface Plan {
  id: number;
  name: string;
}

interface CreateUserFormProps {
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const CreateUser: React.FC<CreateUserFormProps> = ({ onSuccess, onLoadingChange }) => {
  const { user } = useAuth();
  // if (!user) return null;
  
  // State for dynamically loaded data
  const [roles, setRoles] = useState<Role[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dataLoading, setDataLoading] = useState(true); 

  // Form state
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); 
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>(''); 
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(dataLoading || inviteLoading);
  }, [dataLoading, inviteLoading, onLoadingChange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, plansRes] = await Promise.all([
          // Use the new routes defined in auth.routes.js
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/getRoles`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/getPlans`, { credentials: "include" }),
        ]);

        const rolesData = await rolesRes.json();
        const plansData = await plansRes.json();

        if (rolesRes.ok && rolesData.roles) {
          setRoles(rolesData.roles);
          // Set initial role to 'user' or the first available role if 'user' isn't found
          const defaultRole = rolesData.roles.find((r: Role) => r.name === 'user')?.name || rolesData.roles[0]?.name || '';
          setSelectedRole(defaultRole);
        } else {
          console.error("Failed to fetch roles:", rolesData.message);
        }

        if (plansRes.ok && plansData.plans) {
          setPlans(plansData.plans);
          // Set initial plan to the first available plan (assuming id 1 is the default)
          const defaultPlanId = plansData.plans[0]?.id || '';
          setSelectedPlanId(defaultPlanId);
        } else {
           console.error("Failed to fetch plans:", plansData.message);
        }

      } catch (error) {
        console.error("Network or API error during data fetch:", error);
        setMessage({ type: "error", text: "Failed to load roles and plans from the server." });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Simple email validation
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleInviteUser = async () => {
    setMessage(null);

    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    
    // Safety check, though the route should be admin-protected
    if (user?.role !== "ROLE_ADMIN") {
      setMessage({ type: "error", text: "Permission denied. Only Administrators can invite users." });
      return;
    }
    if (!selectedRole || !selectedPlanId) {
        setMessage({ type: "error", text: "Please select a role and a plan." });
        return;
    }

    setInviteLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role: selectedRole,
            planId: selectedPlanId,
            name: fullname
          }),
          credentials: "include", 
        }
      );
      
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Failed to send invitation." });
      } else {
        setMessage({ 
            type: "success", 
            text: data.message || `Invitation sent successfully to ${email}.` 
        });
        // Clear form fields on success and reset selectors to their defaults
        setEmail("");
        setFullname("");
        setSelectedRole(roles.find((r) => r.name === 'user')?.name || roles[0]?.name || '');
        setSelectedPlanId(plans[0]?.id || '');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "A network error occurred." });
    } finally {
      setInviteLoading(false);
    }
  };

  // Render loading state while fetching roles/plans
  if (dataLoading) {
    return (
      <Box sx={{ p: 4, maxWidth: 500, margin: "auto", display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Roles and Plans...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 500, margin: "auto", border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Create User
      </Typography>

      <TextField 
        label="User Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        type="email"
        required
      />

      <TextField 
        label="Fullname"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        fullWidth
        margin="normal"
        type="text"
        required
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Role</InputLabel>
        <Select
          value={selectedRole}
          label="Role"
          onChange={(e) => setSelectedRole(e.target.value as string)}
          // Disable if no roles are loaded
          disabled={roles.length === 0}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.name}>
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" required>
        <InputLabel>Plan</InputLabel>
        <Select
          value={selectedPlanId}
          label="Plan"
          onChange={(e) => setSelectedPlanId(e.target.value as number)}
          disabled={plans.length === 0}
        >
          {plans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleInviteUser}
        disabled={inviteLoading || !email || !selectedRole || !selectedPlanId}
        fullWidth
        sx={{ mt: 3 }}
      >
        {inviteLoading ? "Sending Invitation..." : "Send Invitation"}
      </Button>
    </Box>
  );
};

export default CreateUser;