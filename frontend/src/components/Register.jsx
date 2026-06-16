import {
  divider,
  errorClass,
  formCard,
  formGroup,
  formTitle,
  inputClass,
  labelClass,
  pageBackground,
  submitBtn,
  mutedText,
  linkClass,
} from "../styles/common";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";

function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview, setPriview] = useState(null);
  const navigate = useNavigate();
  const selectedRole = watch("role");

  //When user registration submitted
  const onUserRegister = async (userObj) => {
    let { profileImageUrl } = userObj;
    // file + userObj -->FormData
    const formData = new FormData();
    formData.append("role", userObj.role);
    formData.append("firstName", userObj.firstName);
    formData.append("lastName", userObj.lastName || "");
    formData.append("email", userObj.email);
    formData.append("password", userObj.password);

    if (userObj.role === "COUNSELOR") {
      formData.append("qualifications", userObj.qualifications || "");
      formData.append("certifications", userObj.certifications || "");
      formData.append("yearsOfExperience", userObj.yearsOfExperience || 0);
      formData.append("expertise", userObj.expertise || "");
      formData.append("bio", userObj.bio || "");
    }

    //Append if image is exists
    if (profileImageUrl?.[0]) {
      formData.append("profileImageUrl", profileImageUrl[0]);
    }

    try {
      //start loading
      setLoading(true);
      setApiError(null);
      //make HTTP POST req to create User in backend
      let res = await axios.post(`${API_BASE_URL}/auth/users`, formData, { withCredentials: true });

      if (res.status === 201) {
        toast.success("Account created. Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      console.log("err in registration", err);
      setApiError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className={formCard}>
        <h2 className={formTitle}>Create a MANO-SAATHI Account</h2>
        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>
          <div className="mb-5">
            <p className={labelClass}>Register as</p>
            <div className="flex flex-wrap gap-5 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#123F31]">
                <input type="radio" value="STUDENT" {...register("role", { required: "Please select a role" })} className="accent-[#0E4A37] w-4 h-4" />
                Student
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[#123F31]">
                <input type="radio" value="COUNSELOR" {...register("role", { required: "Please select a role" })} className="accent-[#0E4A37] w-4 h-4" />
                Counselor
              </label>
            </div>
            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div className={divider} />

          <div className="sm:flex gap-4 mb-4">
            <div className="flex-1">
              <label className={labelClass}>First Name</label>
              <input type="text" className={inputClass} placeholder="First name" {...register("firstName", { required: "First name is required", minLength: { value: 2, message: "At least 2 characters required" }, validate: (v) => v.trim().length > 0 || "Cannot be empty" })} />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <label className={labelClass}>Last Name</label>
              <input type="text" className={inputClass} placeholder="Last name" {...register("lastName")} />
            </div>
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} placeholder="you@example.com" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Password</label>
            <input type="password" className={inputClass} placeholder="Enter password" {...register("password", { required: "Password is required" })} />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {selectedRole === "COUNSELOR" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={formGroup}>
                <label className={labelClass}>Qualifications</label>
                <input className={inputClass} placeholder="MA Psychology" {...register("qualifications")} />
              </div>
              <div className={formGroup}>
                <label className={labelClass}>Certifications</label>
                <input className={inputClass} placeholder="Counseling certificate" {...register("certifications")} />
              </div>
              <div className={formGroup}>
                <label className={labelClass}>Years of Experience</label>
                <input type="number" className={inputClass} placeholder="3" {...register("yearsOfExperience")} />
              </div>
              <div className={formGroup}>
                <label className={labelClass}>Expertise</label>
                <input className={inputClass} placeholder="Stress, Anxiety, Study motivation" {...register("expertise")} />
              </div>
              <div className="sm:col-span-2 mb-4">
                <label className={labelClass}>Bio</label>
                <textarea className={`${inputClass} min-h-24`} placeholder="Write a short supportive introduction" {...register("bio")} />
              </div>
            </div>
          )}

          <div className={formGroup}>
            <label className={labelClass}>Profile Image</label>
            <input
              type="file"
              className={inputClass}
              accept="image/png, image/jpeg"
              {...register("profileImageUrl", {
                validate: {
                  fileType: (files) => !files?.[0] || ["image/png", "image/jpeg"].includes(files[0].type) || "Only JPG/PNG allowed",
                  fileSize: (files) => !files?.[0] || files[0].size <= 2 * 1024 * 1024 || "Max size 2MB",
                },
              })}
              onChange={(event) => {
                let file = event.target.files[0];
                if (file) setPriview(URL.createObjectURL(file));
              }}
            />
            {errors.profileImageUrl && <p className={errorClass}>{errors.profileImageUrl.message}</p>}
            {preview && <div className="mt-3 flex justify-center"><img src={preview} alt="" className="w-24 h-24 rounded-full object-cover" /></div>}
          </div>

          <button type="submit" disabled={loading} className={submitBtn}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className={`${mutedText} text-center mt-5`}>
          Already have an account? <NavLink to="/login" className={linkClass}>Sign in</NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;

