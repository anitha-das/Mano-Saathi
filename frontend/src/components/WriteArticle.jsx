import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../store/authStore";
import { API_BASE_URL } from "../api/baseURL";
import { formCard, formTitle, formGroup, labelClass, inputClass, submitBtn, errorClass } from "../styles/common";

function WriteArticle() {
  const currentUser = useAuth((state) => state.currentUser);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const publishArticle = async (articleObj) => {
    try {
      articleObj.counselor = currentUser.id || currentUser._id;
      const res = await axios.post(`${API_BASE_URL}/counselor-api/article`, articleObj, { withCredentials: true });
      toast.success(res.data.message);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish article");
    }
  };

  return (
    <div className={formCard}>
      <h2 className={formTitle}>Publish Wellness Article</h2>
      <form onSubmit={handleSubmit(publishArticle)}>
        <div className={formGroup}>
          <label className={labelClass}>Title</label>
          <input className={inputClass} placeholder="Stress management for students" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>
        <div className={formGroup}>
          <label className={labelClass}>Category</label>
          <input className={inputClass} placeholder="Stress Management" {...register("category", { required: "Category is required" })} />
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>
        <div className={formGroup}>
          <label className={labelClass}>Content</label>
          <textarea className={`${inputClass} min-h-48`} placeholder="Write calm guidance..." {...register("content", { required: "Content is required" })} />
          {errors.content && <p className={errorClass}>{errors.content.message}</p>}
        </div>
        <button className={submitBtn}>Publish Article</button>
      </form>
    </div>
  );
}

export default WriteArticle;

