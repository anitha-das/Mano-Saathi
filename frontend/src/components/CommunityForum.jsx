import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { cardClass, headingClass, bodyText, mutedText, inputClass, submitBtn, ghostBtn, emptyStateClass } from "../styles/common";

function CommunityForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState({});
  const { register, handleSubmit, reset } = useForm();

  const getPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/forum-api/posts`, { withCredentials: true });
      setPosts(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const createPost = async (postObj) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/forum-api/posts`, postObj, { withCredentials: true });
      setPosts([res.data.payload, ...posts]);
      toast.success(res.data.message);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    }
  };

  const addComment = async (postId) => {
    try {
      const comment = commentText[postId];
      if (!comment) return toast.error("Enter a comment");
      const res = await axios.put(`${API_BASE_URL}/forum-api/comments`, { postId, comment }, { withCredentials: true });
      setPosts(posts.map((post) => (post._id === postId ? res.data.payload : post)));
      setCommentText({ ...commentText, [postId]: "" });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  const supportPost = async (postId) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/forum-api/support`, { postId }, { withCredentials: true });
      setPosts(posts.map((post) => (post._id === postId ? res.data.payload : post)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update support");
    }
  };

  const reportPost = async (postId) => {
    try {
      const reason = window.prompt("Reason for report");
      if (!reason) return;
      const res = await axios.post(`${API_BASE_URL}/forum-api/reports`, { targetType: "POST", post: postId, reason }, { withCredentials: true });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report content");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={cardClass}>
        <h2 className={headingClass}>Share anonymously</h2>
        <p className={`${bodyText} mt-2`}>Your post appears as Anonymous Student.</p>
        <form onSubmit={handleSubmit(createPost)} className="mt-5">
          <select className={inputClass} {...register("feeling", { required: true })}>
            <option value="STRESSED">Stressed</option>
            <option value="ANXIOUS">Anxious</option>
            <option value="LONELY">Lonely</option>
            <option value="CALM">Calm</option>
            <option value="MOTIVATED">Motivated</option>
          </select>
          <textarea className={`${inputClass} min-h-32 mt-4`} placeholder="Write what you are feeling..." {...register("content", { required: true })} />
          <button className={submitBtn}>Post Safely</button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-5">
        {loading && <p className={mutedText}>Loading posts...</p>}
        {!loading && posts.length === 0 && <p className={emptyStateClass}>No community posts yet.</p>}
        {posts.map((postObj) => (
          <div key={postObj._id} className={cardClass}>
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-semibold text-[#123F31]">Anonymous Student</p>
                <p className={mutedText}>{postObj.feeling}</p>
              </div>
              <button className={ghostBtn} onClick={() => reportPost(postObj._id)}>Report</button>
            </div>
            <p className={`${bodyText} mt-4`}>{postObj.content}</p>
            <button className={`${ghostBtn} mt-4`} onClick={() => supportPost(postObj._id)}>
              Support ({postObj.reactions?.length || 0})
            </button>

            <div className="mt-5 space-y-3">
              {postObj.comments?.map((commentObj) => (
                <div key={commentObj._id} className="bg-[#F7F8F1] border border-[#DDE7D8] rounded-lg p-4 shadow-[0_8px_22px_rgba(24,76,56,0.05)]">
                  <p className="text-sm font-semibold text-[#123F31]">
                    {commentObj.user?.role === "COUNSELOR" ? `Counselor ${commentObj.user?.firstName || ""}` : "Community Member"}
                  </p>
                  <p className="text-sm text-[#6E725F] mt-1">{commentObj.comment}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <input className={inputClass} placeholder="Add a supportive comment" value={commentText[postObj._id] || ""} onChange={(e) => setCommentText({ ...commentText, [postObj._id]: e.target.value })} />
              <button className="shrink-0 bg-[#0E4A37] hover:bg-[#166044] text-white px-4 rounded-lg text-sm font-bold transition" onClick={() => addComment(postObj._id)}>Send</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityForum;


