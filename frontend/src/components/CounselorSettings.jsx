import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { formCard, formTitle, formGroup, labelClass, inputClass, submitBtn } from "../styles/common";

function CounselorSettings() {
  const { register, handleSubmit } = useForm();

  const updateProfile = async (profileObj) => {
    try {
      profileObj.expertise = profileObj.expertise ? profileObj.expertise.split(",").map((item) => item.trim()) : [];
      const res = await axios.put(`${API_BASE_URL}/counselor-api/profile`, profileObj, { withCredentials: true });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className={formCard}>
      <h2 className={formTitle}>Counselor Profile</h2>
      <form onSubmit={handleSubmit(updateProfile)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={formGroup}><label className={labelClass}>Qualifications</label><input className={inputClass} {...register("qualifications")} /></div>
          <div className={formGroup}><label className={labelClass}>Certifications</label><input className={inputClass} {...register("certifications")} /></div>
          <div className={formGroup}><label className={labelClass}>Years of Experience</label><input type="number" className={inputClass} {...register("yearsOfExperience")} /></div>
          <div className={formGroup}><label className={labelClass}>Availability</label><select className={inputClass} {...register("availabilityStatus")}><option value="AVAILABLE">Available</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option></select></div>
        </div>
        <div className={formGroup}><label className={labelClass}>Expertise</label><input className={inputClass} placeholder="Stress, Anxiety" {...register("expertise")} /></div>
        <div className={formGroup}><label className={labelClass}>Bio</label><textarea className={`${inputClass} min-h-28`} {...register("bio")} /></div>
        <button className={submitBtn}>Update Profile</button>
      </form>
    </div>
  );
}

export default CounselorSettings;

